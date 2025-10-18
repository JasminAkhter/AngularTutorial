import { Component, OnInit, OnDestroy } from '@angular/core';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit, OnDestroy {

  banks: Bank[] = [];
  displayedColumns: string[] = ['bankID', 'bankName', 'accountNumber', 'bankAddress', 'actions'];
  
  bankData: Bank = {
    bankID: 0,
    bankName: '',
    accountNumber: '',
    accountType: '',
    bankAddress: ''
  };

  private unsubscribe$ = new Subject<void>();
  isEditMode = false;
  editingBankId?: number;

  constructor(private bankService: BankService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadBanks(): void {
    this.bankService.getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: Bank[]) => this.banks = data,
        error: (err) => console.error('Error fetching banks:', err)
      });
  }

  reset(form?: NgForm): void {
    if (form) form.resetForm();
    this.bankData = { bankID: 0, bankName: '', accountNumber: '', accountType: '', bankAddress: '' };
    this.isEditMode = false;
    this.editingBankId = undefined;
    this.loadBanks();
  }

  editBank(bank: Bank): void {
    this.isEditMode = true;
    this.editingBankId = bank.bankID;
    this.bankData = { ...bank };
    console.log('Editing bank:', this.bankData);
  }

  saveBank(bankForm: NgForm): void { 
    if (!bankForm.valid) {
      this.snackBar.open('Please fill all required fields!', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    if (this.isEditMode && this.editingBankId != null) {
      this.bankService.update(this.editingBankId, this.bankData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            this.loadBanks();
            this.reset(bankForm);
            this.snackBar.open('Bank updated successfully!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
          },
          error: (err) => console.error(err)
        });
    } else {
      this.bankService.create(this.bankData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.banks.push(data);
            this.reset(bankForm);
            this.snackBar.open('Bank added successfully!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
          },
          error: (err) => console.error(err)
        });
    }
  }

  deleteBank(id?: number): void {
    if (id == null) return;
    if (!confirm('Are you sure you want to delete this bank?')) return;

    this.bankService.delete(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => this.banks = this.banks.filter(b => b.bankID !== id),
        error: (err) => console.error(err)
      });
  }

  
}
