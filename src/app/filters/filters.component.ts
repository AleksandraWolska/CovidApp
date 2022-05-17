import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CountryData } from '../content/content.component';

//Component to group selected filters in SelectedData object. The object is sent to parent after clicking ShowData button


export class SelectedData {
	countriesArr: string[] = []	//Slug
	typeArr: string[] = []		// Active, Deaths, Confirmed
	dateVariant: string = ""	//date-total, date-day, date-range
	startDate: string = ""		//iso format
	endDate: string = ""		//iso format
}

@Component({
	selector: 'app-filters',
	templateUrl: './filters.component.html',
	styleUrls: ['./filters.component.css']
})


export class FiltersComponent implements OnInit {

	@Input() countries: CountryData[]
	@Input() selectedData: SelectedData
	@Output() selectEvent = new EventEmitter<SelectedData>()

	dateVariant: string = "date-total"
	shouldDrop: boolean = false
	minDate: Date = new Date(2020, 1, 22)
	maxDate: Date = new Date(new Date().setDate(new Date().getDate() - 1)); //yeaterday :)
	errorMessages: string[] = []
	

	//functions to handle filters view
	range = new FormGroup({					//range datepicker handler
		start: new FormControl(),
		end: new FormControl(),
	});

	day = new FormControl()					//one day datepicker handler



	toggleFullRange(event: any) {
		if (event.target.checked) {
			this.range = new FormGroup({
				start: new FormControl(this.minDate),
				end: new FormControl(this.maxDate)
			})
		} else {
			this.range = new FormGroup({
				start: new FormControl(),
				end: new FormControl(),
			});

		}
	}


	dropToggler(action: any): void {
		action === undefined ?
			this.shouldDrop = !this.shouldDrop :
			this.shouldDrop = action
	}


	isCountriesEmpty(): boolean {
		return this.selectedData.countriesArr.length == 0
	}



	//functions to handle selected data object ---------------------------------------------

	updateDateVariant = (): void => {
		this.selectedData.dateVariant = this.dateVariant
		if (this.dateVariant == 'date-range') {
			this.day = new FormControl()
		} else {
			this.range = new FormGroup({
				start: new FormControl(),
				end: new FormControl(),
			})
		}
	}


	updateDay = (event: any) => {
		this.selectedData.startDate = (this.day.value).toISOString()
		this.selectedData.endDate = (new Date(new Date(this.day.value).setDate(new Date(this.day.value).getDate() + 1))).toISOString()
	}

	updateDates = (): void => {
		if (this.selectedData.dateVariant == 'date-range') {
			if(this.range.value.start < this.minDate || this.range.value.end > this.maxDate) throw new Error('Invalid Data')
			this.selectedData.startDate = (this.range.value.start).toISOString()
			this.selectedData.endDate = (this.range.value.end).toISOString()
		} else if (this.selectedData.dateVariant == 'date-day') {
			if(this.day.value < this.minDate || this.day.value > this.maxDate) throw new Error('Invalid Data')
			this.selectedData.startDate = (this.day.value).toISOString()
			this.selectedData.endDate = (new Date(new Date(this.day.value).setDate(new Date(this.day.value).getDate() + 1))).toISOString()	//set end date to tomorrow of chosen day
		} else {
			this.selectedData.startDate = (new Date(new Date(this.maxDate).setDate(new Date(this.maxDate).getDate() - 1))).toISOString()  //set start date to yesterdays's value
			this.selectedData.endDate = (this.maxDate).toISOString()
		}
	}


	includeCountry = (val: string): void => {
		let pos = this.selectedData.countriesArr.indexOf(val)
		pos < 0 ? this.selectedData.countriesArr.push(val) : this.selectedData.countriesArr.splice(pos, 1)

	}

	isChecked = (val: string): string => {
		return this.selectedData.countriesArr.includes(val) ? "checked" : "notChecked"
	}

	includeCaseType = (val: string): void => {
		let pos = this.selectedData.typeArr.indexOf(val)
		pos < 0 ? this.selectedData.typeArr.push(val) : this.selectedData.typeArr.splice(pos, 1)
	}

	applyFilters = () => {
		this.errorMessages.length = 0
		if (this.selectedData.typeArr.length == 0) this.errorMessages.push("Don't you want to choose case type?")

		this.selectedData.dateVariant = this.dateVariant

		if (this.selectedData.typeArr.length > 1 && this.selectedData.dateVariant == 'date-range' && this.selectedData.countriesArr.length > 1) {
			this.errorMessages.push("Sorry, this feature is not yet implemented. \nTry either choosing only one case type or one country.")
		}
		try {
			this.updateDates()
			console.log(this.selectedData)
			this.selectEvent.emit(this.selectedData)
		} catch (error) {
			this.errorMessages.push("Input correct date")
		}
	}

	constructor() {}

	ngOnInit(): void {}

}
