import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SelectedData } from '../filters/filters.component';


// API data formats ----------------------------------------------------------------------------------------
//https://api.covid19api.com/countries
export class CountryData {
	Country: string;
	Slug: string;
	ISO2: string
}

//Get List Of Cases Per Country By Case Type From The First Recorded Case
//https://api.covid19api.com/total/country/:country?from=:startdate&to=:enddate
export class CountryTotal {
	Country: string;
	CountryCode: string;
	Province: string;
	City: string;
	CityCode: string;
	Lat: string;
	Lon: string;
	Confirmed: number;
	Deaths: number;
	Recovered: number;
	Active: number;
	Date: string  //2020-03-04T00:00:00Z
}

//https://api.covid19api.com/summary
export class SummaryCountry {
	ID: string
	Country: string
	CountryCode: string
	Slug: string
	NewConfirmed: number
	TotalConfirmed: number
	NewDeaths: number
	TotalDeaths: number
	NewRecovered: number
	TotalRecovered: number
	Date: string
	Premium: {}
}

//https://api.covid19api.com/summary
export class Summary {
	ID: string
	Message: ""
	Global: {
		NewConfirmed: 377566,
		TotalConfirmed: 518530147,
		NewDeaths: 1229,
		TotalDeaths: 6255252,
		NewRecovered: 0,
		TotalRecovered: 0,
		Date: string 		//format: 2022-05-13T06:31:32.704Z
	}
	Countries: SummaryCountry[]
}



@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.css']
})

export class ContentComponent implements OnInit {

	//indicates if result can be displayed as chart/table
	chartEnabled = false
	tableEnabled = false
	tableChartVariant: string = ""

	tableNames: String[] = []
	columnHeaders: (String[])[] = []

	selectedData: SelectedData = new SelectedData()
	dataArray: CountryTotal[] | SummaryCountry[]	//data of objects fetched from API that match criterias
	countries: CountryData[]

	constructor(private httpClient: HttpClient) { }



	getCountries() {

		this.httpClient.get<CountryData[]>('https://api.covid19api.com/countries').subscribe(
			response => {
				let tempCountries: CountryData[]
				tempCountries = response
				tempCountries.sort(function (a, b) { return a.Country.localeCompare(b.Country) })

				//display more popular countries first
				let popularList: string[] = ["poland", "germany", "france", "greece", "czech-republic", "switzerland", "luxembourg", "slovakia", "denmark", "belgium", "italy", "ukraine", "japan", "iceland", "spain", "brazil", "russia", "serbia"]
				let popularCountries: CountryData[]
				popularCountries = tempCountries.filter((country) => { return popularList.includes(country.Slug) })
				tempCountries = tempCountries.filter((country) => { return !popularList.includes(country.Slug) })
				this.countries = popularCountries.concat(tempCountries)
			}
		)
	}


	clearTableData = () => {
		this.tableChartVariant = ""
		this.tableNames.length = 0
		this.columnHeaders.length = 0
	}

	allCountriesTotalDate = () => {
		this.clearTableData()

		let copiedArray = [...this.selectedData.typeArr]
		this.tableEnabled = true
		this.chartEnabled = false
		copiedArray = copiedArray.map((elem) => "Total" + elem)
		this.tableNames.push("total cases in all countries")
		this.columnHeaders.push(["Country", ...copiedArray])

		this.httpClient.get<Summary>('https://api.covid19api.com/summary').subscribe(
			response => {
				this.dataArray = response.Countries
				this.tableChartVariant = 'table'
			}
		)
	}


	oneCountry = () => {
		let address = "https://api.covid19api.com/total/country/" + this.selectedData.countriesArr[0] + "?from=" + this.selectedData.startDate + "&to=" + this.selectedData.endDate
		this.httpClient.get<CountryTotal[]>(address).subscribe(
			response => {
				this.dataArray = response
				this.clearTableData()
				this.tableEnabled = true
				this.chartEnabled = (this.selectedData.typeArr.length <= 1)
				this.tableChartVariant = this.selectedData.dateVariant == "date-range" ? "chart" : "table"

				this.tableNames.push(this.dataArray[0].Country)


				this.selectedData.dateVariant == "date-total" ?
					this.columnHeaders.push([...this.selectedData.typeArr]) :
					this.columnHeaders.push(["Date", ...this.selectedData.typeArr])
			}
		)
	}



	moreCountriesTotalOneDate = () => {

		let tempDataArray: CountryTotal[] = []
		for (let i = 0; i < this.selectedData.countriesArr.length; i++) {
			let address = "https://api.covid19api.com/total/country/" + this.selectedData.countriesArr[i] + "?from=" + this.selectedData.startDate + "&to=" + this.selectedData.endDate
			this.httpClient.get<CountryTotal[]>(address).subscribe(response => {
				tempDataArray.push(...response)
			}
			)
		}

		setTimeout(() => {					//I wanted to fetch data "angular way", without promises (and .toPromise() as it is deprecated)
											//Fetching here is done in a for loop (each country) and I can't really get it right so I'll just delay subsequent lines
			this.clearTableData()
			this.tableEnabled = true
			this.chartEnabled = (this.selectedData.typeArr.length <= 1)
			this.selectedData.dateVariant == "date-total" ?
				this.tableNames.push("Total") :
				this.tableNames.push((new Date(this.selectedData.startDate)).toLocaleDateString())

			this.columnHeaders[0] = ["Country", ...this.selectedData.typeArr]
			this.dataArray = tempDataArray
			this.tableChartVariant = 'table'
		}, 400
		)
	}



	moreCountriesRangeDateOneType = () => {

		let tempDataArray: CountryTotal[] = []
		for (let i = 0; i < this.selectedData.countriesArr.length; i++) {
			let address = "https://api.covid19api.com/total/country/" + this.selectedData.countriesArr[i] + "?from=" + this.selectedData.startDate + "&to=" + this.selectedData.endDate
			console.log(address)
			this.httpClient.get<CountryTotal[]>(address).subscribe(response => {
				tempDataArray.push(...response)
			}
			)
		}

		setTimeout(() => {
			this.clearTableData()
			this.tableChartVariant = 'chart'
			this.tableEnabled = false
			this.chartEnabled = true
			this.tableNames.push(this.selectedData.typeArr[0])
			let tempCountriesArray = this.countries.filter((c) => { return this.selectedData.countriesArr.includes(c.Slug) })
			let tempArray = tempCountriesArray.map((c) => c.Country)
			this.columnHeaders.push(["Date", ...tempArray])
			this.dataArray = tempDataArray

		}, 400)
	}


	
	moreCountriesRangeDateMoreTypes = () => {
		//https://api.covid19api.com/total/country/:country  foreach loop country
		//not yet implemented
	}


	receiveSelected($event: SelectedData) {
		this.selectedData = $event

		if (this.selectedData.countriesArr.length == 0) {            //no country is chosen - all countries then 			
			if (this.selectedData.typeArr.length >= 1) {			//datetype must be total
				this.allCountriesTotalDate()
			}

		} else if (this.selectedData.countriesArr.length == 1) {     //one country is chosen
			this.oneCountry()
		} else {                                                     //more countries are chosen

			if (this.selectedData.dateVariant != 'date-range') {
				this.moreCountriesTotalOneDate()
			} else {
				if (this.selectedData.typeArr.length > 1) {			//more types - few tables (each for one case)
					this.moreCountriesRangeDateMoreTypes()
				} else {                                              //only one type
					this.tableChartVariant = 'chart'
					this.moreCountriesRangeDateOneType()
				}
			}
		}
	}



	ngOnInit(): void {
		this.getCountries()
	}
}
