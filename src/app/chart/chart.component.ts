import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CountryData, CountryTotal, SummaryCountry } from '../content/content.component';
import { SelectedData } from '../filters/filters.component';

class ChartDataObject {
  label: string
  data: number[]
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})



export class ChartComponent implements OnInit {

  @Input() dataArray: CountryTotal[] | SummaryCountry[]
  @Input() selectedData: SelectedData
  @Input() columnHeaders: (String[])[]
  @Input() tableNames: String[]
  @Input() countries: CountryData[]

  display: boolean
  barChartLabels: string[]
  
  lineChartData: ChartDataObject[];
  barChartData: ChartDataObject[];



  ngOnChanges(changes: SimpleChanges): void {
    this.display = false
    this.updateCharts()
  }

  ngOnInit(): void {
    this.dataArray = []
    this.columnHeaders = []
    this.tableNames = []
  }

  addDays = function (start: Date, days: number) {
    var dat = new Date(start.valueOf())
    dat.setDate(dat.getDate() + days)
    return dat;
  }


  //function creating an array of dates for chart label
  getDates(selectedData: SelectedData) {
    var dateArray = new Array();

    var currentDate = selectedData.startDate;
    while (currentDate < selectedData.endDate) {
      dateArray.push(currentDate)
      currentDate = (this.addDays(new Date(currentDate), 1)).toISOString();
    }
    return dateArray;
  }



  updateCharts() {
    if (!this.dataArray) return
    this.barChartLabels = this.getDates(this.selectedData).map((date) => new Date(date).toLocaleDateString("en-US"))

    let data: CountryTotal[][] = []

    let tempCountriesArray = this.countries.filter((c) => { return this.selectedData.countriesArr.includes(c.Slug) })
    console.log(tempCountriesArray)
    let tempCountries = tempCountriesArray.map((c) => c.Country)

    tempCountries.forEach((country, idx) => {
      let temp: CountryTotal[] = []
      this.dataArray.forEach((element) => {
        if (element == undefined) return

        if (element.Country == country) {
          temp.push(<CountryTotal>element)
        }
      })
      if (temp.length) data.push(temp)
    })

    this.barChartData = []

    data.forEach((arr) => {

      let ch = new ChartDataObject()
      ch.label = arr[0].Country
      ch.data = []
      arr.forEach((obj) => {
        ch.data.push(<number>obj[this.selectedData.typeArr[0] as keyof CountryTotal])
      })

      this.barChartData.push(ch)
    })

    this.display = true
  }





  

  barChartOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: false
          }
        }
      ]
    },
    legend: {
      display: true
    },
    elements: {
      point: {
        radius: 0
      }

    }
  }

  barChartColors = [
    {
      backgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)"
      ],
      borderColor: [
        "rgba(255,99,132,1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)"
      ]
    }
  ]

}