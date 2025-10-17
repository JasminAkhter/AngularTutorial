import { Component, OnDestroy, OnInit } from '@angular/core';
import { BankService } from '../services/bank.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bank } from '../models/bank';
import { pipe, Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.css'
})
export class BankComponent implements OnInit, OnDestroy {

  constructor(private bankservice: BankService, private snackBar: MatSnackBar) { }
  banks: Bank[] = []; // For GetAll

  private unsubscribe$ = new Subject<void>();

  bankData: Bank = {
    bankID: 0,
    bankName: '',
    accountNumber: '',
    accountType: '',
    bankAddress: ''
  };

  displayedColumns: string[] = [
    'bankID',
    'bankName',
    'accountNumber',
    'accountType',
    'bankAddress',
    'action'
  ];

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.getAll(); // For GetAll
  }

  reset(form?: NgForm): void {
    if (form) {
      form.resetForm(); 
    }
    this.isEditMode = false;
    this.editingBankID = undefined;
    this.getAll();
  }

  // For GetAll
  getAll() {
    this.bankservice.getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: Bank[]) => this.banks = data,
        error: (error) => {
          this.snackBar.open('Error fetching banks!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      });
  }

  isEditMode = false;
  editingBankID?: number;

  saveBankInfo(bankForm: NgForm) {
    if (!bankForm.valid) {
      this.snackBar.open('Please fill all required fields!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    if(this.isEditMode && this.editingBankID != null){
      this.bankservice.update(this.editingBankID, this.bankData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          
          this.reset(bankForm);
          this.snackBar.open('Bank updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else{
      this.bankservice.create(this.bankData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next : (data) => {
            this.banks.push(data);
            this.reset(bankForm);
            this.snackBar.open('Bank added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          },
          error: (err) => {
          console.error(err);
        }
      });
    }
  }

  

}
  




