import { Component, OnInit, Input, ViewChild, SimpleChanges, AfterViewInit} from '@angular/core';
import { SelectedData } from '../filters/filters.component';
import { CountryTotal, SummaryCountry } from '../content/content.component';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})  

export class TableComponent implements AfterViewInit {

  @Input() dataArray : CountryTotal[] | SummaryCountry[]
  @Input() selectedData : SelectedData 
  @Input() columnHeaders : (String[])[] = []
  @Input() tableNames : String[] = []
  data : (SummaryCountry|CountryTotal)[]= []
  dataSource = new MatTableDataSource(this.data)

  
  @ViewChild('sorter') sorter = new MatSort();
  @ViewChild(MatTable) table: MatTable<SummaryCountry | CountryTotal>
  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngAfterViewInit() {
    this.dataSource.sort = this.sorter;
    this.dataSource.paginator = this.paginator;
    
  } 
 
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.dataArray)
    this.data = this.dataArray
    this.data = this.data.map((obj : SummaryCountry | CountryTotal) => {
      obj.Date = (new Date(obj.Date)).toLocaleDateString()
      return obj
    })
    this.dataSource = new MatTableDataSource(this.data)
  }

  constructor() {}
  ngOnInit(): void {}

}
