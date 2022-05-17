import { AfterViewInit, Component, } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {


  reloadPage() {
    window.location.reload();
  }
  constructor() { }

  ngAfterViewInit(): void {}
}
