import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Branch } from '../models/branch';
import { MatDialog } from '@angular/material/dialog';


declare var bootstrap: any;


@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit, OnDestroy {
  modalInstance: any;

  constructor(private bankService: BankService, private snackBar: MatSnackBar) { }

  banks: Bank[] = [];
  displayedColumns: string[] = ['bankID', 'bankName', 'accountNumber', 'bankAddress', 'openingDate', 'branches', 'actions'];

  //add for paginetion
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  searchTerm: string = '';
  displayedBanks: Bank[] = [];
  filteredBanks: Bank[] = [];
  pageNumbers: number[] = [];



  bankData: Bank = {
    bankID: 0,
    bankName: '',
    accountNumber: '',
    accountType: '',
    openingDate: '',
    bankAddress: '',
    branchs: []
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
    this.bankService.getAll().subscribe({
      next: (data: Bank[]) => {
        this.banks = data || [];
        this.filteredBanks = [...this.banks];
        this.resetPagination();
        this.updateDisplayedBanks();
      },
      error: (err) => {
        console.error('Error loading banks:', err);
        this.banks = [];
        this.filteredBanks = [];
        this.resetPagination();
        this.updateDisplayedBanks();
      }
    });
  }

  filterBanks(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBanks = this.banks.filter(b =>
      b.bankName.toLowerCase().includes(term) ||
      b.accountNumber.toLowerCase().includes(term) ||
      (b.accountType && b.accountType.toLowerCase().includes(term)) ||
      (b.bankAddress && b.bankAddress.toLowerCase().includes(term))
    );
    this.resetPagination();
  }

  trackByBankId(index: number, bank: Bank) {
    return bank.bankID;
  }


  private resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.filteredBanks.length / this.pageSize));
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateDisplayedBanks();
  }

  updateDisplayedBanks(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const s = Math.max(0, Math.min(start, this.banks.length));
    const e = Math.max(s, Math.min(end, this.banks.length));
    this.displayedBanks = this.banks.slice(s, e);
  }



  goToPage(page: number) {
    this.currentPage = page;
    this.updateDisplayedBanks();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedBanks();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedBanks();
    }
  }

  refreshAfterChange(): void {
    this.loadBanks();
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

  //new added for edit
  closeModal(): void {
    const modalEl = document.getElementById('bankModal');
    let modal = bootstrap.Modal.getInstance(modalEl);

    if (!modal) {
      modal = new bootstrap.Modal(modalEl);
    }
    modal.hide();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
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
      this.snackBar.open('Please fill all required fields!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.isEditMode && this.editingBankId != null) {
      this.bankService.update(this.editingBankId, this.bankData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            this.closeModal(); // Close modal first
            this.snackBar.open('Bank updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.loadBanks(); // Refresh the list
            this.reset(bankForm); // Reset the form
          },
          error: (err) => {
            console.error('Error updating bank:', err);
            this.snackBar.open('Failed to update bank. Please try again.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
    } else {
      this.bankService.create(this.bankData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.closeModal(); // Close modal first
            this.snackBar.open('Bank added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.loadBanks(); // Refresh the list
            this.reset(bankForm); // Reset the form
          },
          error: (err) => {
            console.error('Error creating bank:', err);
            this.snackBar.open('Failed to add bank. Please try again.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
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
          this.loadBanks();
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

  addBranch(): void {
    if (!this.bankData.branchs) {
      this.bankData.branchs = [];
    }
    this.bankData.branchs.push({
      branchID: 0,
      branchName: '',
      phone: '',
      email: '',
      address: '',
      bankID: this.bankData.bankID
    });
  }

  removeBranch(index: number): void {
    if (this.bankData.branchs) {
      this.bankData.branchs.splice(index, 1);
    }
  }


  // readonly dialog = inject(MatDialog);
  // openDialog() {
  //   this.dialog.open(this.dialogTemplate);
  // }
  // dialogTemplate: any;


}
