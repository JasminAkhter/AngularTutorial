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

  //add for paginetion
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  displayedBanks: Bank[] = []; // subset of banks for current page




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


  searchTerm: string = '';
  filteredBanks: Bank[] = [];

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
        this.filteredBanks = [...this.banks]; // ✅ initialize filtered list
        this.resetPagination();
        this.updateDisplayedBanks();
      },
      error: (err) => {
        console.error('Error loading banks:', err);
        this.banks = [];
        this.filteredBanks = []; // ✅ keep it safe and empty
        this.resetPagination();
        this.updateDisplayedBanks();
      }
    });
  }

  filterBanks(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBanks = this.banks.filter(bank =>
      bank.bankName?.toLowerCase().includes(term) ||
      bank.accountNumber?.toLowerCase().includes(term) ||
      bank.accountType?.toLowerCase().includes(term)
    );
  }


  // loadBanks(): void {
  //   this.bankService.getAll()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe({
  //       next: (data: Bank[]) => this.banks = data,
  //       error: (err) => console.error('Error fetching banks:', err)
  //     });
  // }


  //Added for pegination
  // loadBanks(): void {
  //   this.bankService.getAll().subscribe({
  //     next: (data: Bank[]) => {
  //       this.banks = data || [];
  //       this.resetPagination();
  //       this.updateDisplayedBanks();
  //     },
  //     error: (err) => {
  //       console.error('Error loading banks:', err);
  //       this.banks = [];
  //       this.resetPagination();
  //       this.updateDisplayedBanks();
  //     }
  //   });
  // }


  trackByBankId(index: number, bank: Bank) {
    return bank.bankID;
  }


  private resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.banks.length / this.pageSize));
  }

  updateDisplayedBanks(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    // Defensive guards
    const s = Math.max(0, Math.min(start, this.banks.length));
    const e = Math.max(s, Math.min(end, this.banks.length));
    this.displayedBanks = this.banks.slice(s, e);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    this.totalPages = Math.max(1, Math.ceil(this.banks.length / this.pageSize));
    let start = Math.max(this.currentPage - Math.floor(maxVisible / 2), 1);
    let end = Math.min(start + maxVisible - 1, this.totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedBanks();
  }

  prevPage(): void {
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
            this.loadBanks();
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
