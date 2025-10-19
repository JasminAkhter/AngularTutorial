import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';


declare var bootstrap: any;
//modalInstance: any;


@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit, OnDestroy {
  modalInstance: any;

  constructor(private bankService: BankService, private snackBar: MatSnackBar) { }

  banks: Bank[] = [];
  displayedColumns: string[] = ['bankID', 'bankName', 'accountNumber', 'bankAddress', 'openingDate', 'actions'];

  bankData: Bank = {
    bankID: 0,
    bankName: '',
    accountNumber: '',
    accountType: '',
    openingDate: '',
    bankAddress: ''
  };

  private unsubscribe$ = new Subject<void>();
  isEditMode = false;
  editingBankId?: number;



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
    this.bankData = { bankID: 0, bankName: '', accountNumber: '', accountType: '', openingDate: '', bankAddress: '' };
    this.isEditMode = false;
    this.editingBankId = undefined;
    this.loadBanks();
    this.closeModal();
  }

  //new added for edit
  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('bankModal'));
    modal.show();
  }

  // openModal(): void {
  //   this.modalInstance.show();
  // }

  //new added for edit
  closeModal(): void {
    const modalEl = document.getElementById('bankModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  }



  editBank(bank: Bank): void {
    this.isEditMode = true;
    this.editingBankId = bank.bankID;
    this.bankData = { ...bank };
    console.log('Editing bank:', this.bankData);
    this.openModal();   //New added for edit
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
            //new added for edit
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');

            this.snackBar.open('Bank updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
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
            this.snackBar.open('Data added successfully!', 'Close', {
              duration: 3000, panelClass: ['snackbar-success']
            });
            this.reset(bankForm);
            this.closeModal(); //new added for edit
          },
          error: (err) => console.error(err)
        });
    }
  }

  deleteBank(id?: number): void {
    if (id == null) return;

    if (!confirm('Are you sure you want to delete this data?')) return;

    this.bankService.delete(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {

          this.banks = this.banks.filter(b => b.bankID !== id);
          this.snackBar.open(res?.Message ?? 'Data deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        },
        error: (err) => {
          console.error('Error deleting bank:', err);
          this.snackBar.open('Error deleting bank!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
  }

}
