import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 

@Component({
  selector: 'dna-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './dna-input.component.html',
  styleUrls: ['./dna-input.component.css']
})
export class DnaInputComponent implements OnInit {
  dnaForm!: FormGroup;
  mensaje: string | null = null;
  mensajeHeader: string | null = null; 
  mensajeDescripcion: string = '';
  mensajeAdicional: string = '';
  Color: string = 'blue';
  dnaMatrix: string[][] = [];
  mutatedCells: boolean[][] = [];  // Celdas mutantes

  constructor(private fb: FormBuilder) {
    //this.dnaSecuencia = this.fb.array([]); 
  }

  ngOnInit(): void {
    this.initializeMutatedCells();
    this.dnaForm = this.fb.group({
      dnaSecuencia: this.fb.array([this.crearSecuenciaDNA()])
    });
  }

  initializeMutatedCells() {
    this.mutatedCells = this.dnaMatrix.map(row => row.map(() => false));
  }

  get dnaSecuencia(): FormArray {
    return this.dnaForm.get('dnaSecuencia') as FormArray;
  }

  onSubmit(): void {
    if (this.dnaForm.valid) {
      const dnaMatrix = this.dnaForm.value.dnaSecuencia.map((row: { sequence: string }) => row.sequence);
      this.mensaje = JSON.stringify(dnaMatrix, null, 2);

      const longitudMatriz = dnaMatrix.length;
      const ocurrencias = 4; // Cantidad de secuencias consecutivas que se consideran mutantes
  
      const esMutante = this.isMutant(dnaMatrix, longitudMatriz, ocurrencias);
  
      // Si se encuentra una mutación, resaltar las celdas correspondientes
      this.mutatedCells = this.getMutatedCells(dnaMatrix, longitudMatriz, ocurrencias);
  
      if (esMutante== 1) {
        this.mensajeHeader = '¡Mutante Detectado!';
        this.mensajeDescripcion = `Se encontrarón 1 Mutación el ADN aún es Humano.`;
        this.mensajeAdicional = `Se encontrarón 1 Mutación el ADN aún es Humano.`;
        this.Color = 'blue';
      } 
      else if (esMutante> 1) {
          this.mensajeHeader = '¡Mutante Detectado!';
          this.mensajeDescripcion = `El ADN No es Humano. Mutaciones encontradas : ${esMutante}.`;
          this.mensajeAdicional = `El ADN No es Humano. Mutaciones encontradas : ${esMutante}.`;      
          this.Color = 'red';
      }      
      else {
        this.mensajeHeader = '¡No es un Mutante!';
        this.mensajeDescripcion = 'El ADN es Humano.';
        this.mensajeAdicional = 'El ADN es Humano.';;
        this.Color = 'green';
      }
    }
  }
  crearSecuenciaDNA(): FormGroup {
    return this.fb.group({
      sequence: ['', [Validators.required, Validators.pattern(/^[ATCG]+$/i)]] 
    });
  }

  AgregarSecuanciaDNA(): void {
    const secuenciaValida = this.dnaSecuencia.at(this.dnaSecuencia.length - 1).get('sequence')?.value;
    if (secuenciaValida && secuenciaValida.length >= 3) {
      const longitudPrimeraSecuencia = this.dnaSecuencia.at(0).get('sequence')?.value.length;
      if (secuenciaValida.length === longitudPrimeraSecuencia) {
        this.dnaSecuencia.push(this.crearSecuenciaDNA());
        this.actualizarMatriz();
        
      } else {        
        this.mensajeHeader = 'Error!';
        this.mensajeDescripcion = 'Las Nuevas Secuencias deben tener la misma Longitud que la primera.';
        this.Color = 'red';
      }
    } else { 
      this.mensajeHeader = 'Error!';
      this.mensajeDescripcion = 'Por favor, Ingresa una secuencia válida antes de agregar una nueva.';
      this.Color = 'red';
     }
  }

  EliminarSecuanciaDNA(index: number): void {
    this.dnaSecuencia.removeAt(index);
    this.actualizarMatriz(); // Actualizamos la matriz al eliminar una secuencia.
  }
  // Función para obtener las celdas mutantes
  getMutatedCells(dna: string[][], longitudmatriz: number, ocurrencias: number): boolean[][] {
    let mutatedCells = Array.from({ length: dna.length }, () => Array(dna[0].length).fill(false));

    // Detectar mutaciones y marcar las celdas mutantes
    // Filas
    for (let i = 0; i < dna.length; i++) {
      let contador = 1;
      for (let j = 1; j < dna[i].length; j++) {
        if (dna[i][j] === dna[i][j - 1]) {
          contador++;
          if (contador >= ocurrencias) {
            for (let k = j; k >= j - ocurrencias + 1; k--) {
              mutatedCells[i][k] = true;
            }
          }
        } else {
          contador = 1;
        }
      }
    }

    // Columnas
    for (let j = 0; j < longitudmatriz; j++) {
      let contador = 1;
      for (let i = 1; i < dna.length; i++) {
        if (dna[i][j] === dna[i - 1][j]) {
          contador++;
          if (contador >= ocurrencias) {
            for (let k = i; k >= i - ocurrencias + 1; k--) {
              mutatedCells[k][j] = true;
            }
          }
        } else {
          contador = 1;
        }
      }
    }

    // Diagonales
    for (let i = 0; i < longitudmatriz - ocurrencias + 1; i++) {
      for (let j = 0; j < longitudmatriz - ocurrencias + 1; j++) {
        let contador = 1;
        for (let k = 1; k < ocurrencias; k++) {
          if (dna[i + k][j + k] === dna[i + k - 1][j + k - 1]) {
            contador++;
            if (contador >= ocurrencias) {
              for (let m = k; m >= k - ocurrencias + 1; m--) {
                mutatedCells[i + m][j + m] = true;
              }
            }
          } else {
            contador = 1;
          }
        }
      }
    }

    // Diagonales de abajo hacia arriba
    for (let i = longitudmatriz - 1; i >= ocurrencias - 1; i--) {
      for (let j = 0; j < longitudmatriz - ocurrencias + 1; j++) {
        let contador = 1;
        for (let k = 1; k < ocurrencias; k++) {
          if (dna[i - k][j + k] === dna[i - k + 1][j + k - 1]) {
            contador++;
            if (contador >= ocurrencias) {
              for (let m = k; m >= k - ocurrencias + 1; m--) {
                mutatedCells[i - m][j + m] = true;
              }
            }
          } else {
            contador = 1;
          }
        }
      }
    }

    return mutatedCells;
  }

  isMutant(dna: string[][], longitudmatriz: number, ocurrencias: number): number {
    let secuencias = 0;

    secuencias += this.encontrarSecuenciasFilas(dna,ocurrencias);
    secuencias += this.encontrarSecuenciasColumnas(dna,longitudmatriz,ocurrencias);
    secuencias += this.encontrarSecuenciasDiagAribaAbajo(dna,longitudmatriz,ocurrencias);
    secuencias += this.encontrarSecuenciasDiagAbajoAriba(dna,longitudmatriz,ocurrencias);

    return secuencias;
}

  
actualizarMatriz(): void {
  if (this.dnaSecuencia.controls.length > 0) {
    // Mapea las secuencias del FormArray en una matriz
    this.dnaMatrix = this.dnaSecuencia.controls.map((control) => {
      const sequenceValue = control.get('sequence')?.value;
      if (sequenceValue) {
       
        return sequenceValue.split('');
      } else {
        return [];
      }
    });
    this.mutatedCells = this.getMutatedCells(this.dnaMatrix, this.dnaMatrix.length, 4);
  }
}

  cerrarModal(): void {
    this.mensajeHeader = null; // Ocultar el mensaje emergente
  }
  encontrarSecuenciasFilas(dna: string[][],ocurrencias:number): number {
    let secuencias = 0;
    for (let i = 0; i < dna.length; i++) {
      let fila = dna[i];
      let contador = 1;

      for (let j = 1; j < fila.length; j++) {
          if (fila[j] === fila[j - 1]) {
              contador++;
              if (contador >= ocurrencias) {
                  secuencias++;
                  contador = 1;
              }
          } else {
              contador = 1; // Reinicia el contador si las letras no coinciden
          }
      }
     }
  return secuencias;
  }

  encontrarSecuenciasColumnas(dna: string[][],longitudmatriz:number,ocurrencias:number): number {
    let secuencias = 0;
    for (let j = 0; j < longitudmatriz; j++) {
      let contador = 1;
      for (let i = 1; i < dna.length; i++) {
          if (dna[i][j] === dna[i - 1][j]) {
              contador++;
              if (contador >= ocurrencias) {
                  secuencias++;
                  contador = 1;
              }
          } else {
              contador = 1;
          }
      }
  }
  return secuencias;
  }

  encontrarSecuenciasDiagAribaAbajo(dna: string[][],longitudmatriz:number,ocurrencias:number): number {
    let secuencias = 0;
    for (let i = 0; i < longitudmatriz - ocurrencias + 1; i++) {
      for (let j = 0; j < longitudmatriz - ocurrencias + 1; j++) {
          let contador = 1;
          for (let k = 1; k < ocurrencias; k++) {
              if (dna[i + k][j + k] === dna[i + k - 1][j + k - 1]) {
                  contador++;
                  if (contador >= ocurrencias) {
                      secuencias++;
                      contador = 1;
                  }
              } else {
                  contador = 1;
              }
          }
      }
  }
  return secuencias;
  }

  encontrarSecuenciasDiagAbajoAriba(dna: string[][],longitudmatriz:number,ocurrencias:number): number {
    let secuencias = 0;
    for (let i = longitudmatriz - 1; i >= ocurrencias - 1; i--) {
      for (let j = 0; j < longitudmatriz - ocurrencias + 1; j++) {
          let contador = 1;
          for (let k = 1; k < ocurrencias; k++) {
              if (dna[i - k][j + k] === dna[i - k + 1][j + k - 1]) {
                  contador++;
                  if (contador >= ocurrencias) {
                      secuencias++;
                      contador = 1;
                  }
              } else {
                  contador = 1;
              }
          }
      }
  }
  return secuencias;
  }

}