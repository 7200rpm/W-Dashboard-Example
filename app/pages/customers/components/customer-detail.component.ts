import {Component, EventEmitter, Input, OnInit, Output, AfterViewInit} from '@angular/core';
import {CustomerService} 			from '../customer.service'
import { Customer } from '../customer';
import { Router, ActivatedRoute }       from '@angular/router';
import { Observable }     from 'rxjs/Observable';
import {AlertComponent} from 'ng2-bootstrap/ng2-bootstrap';

import {CustomerFormComponent} from './customer-form.component'

@Component({
  moduleId: module.id,
  selector: 'customer-detail-cmp',
  templateUrl: 'customer-detail.component.html',
  directives:[AlertComponent, CustomerFormComponent]
})

export class CustomerDetailComponent implements OnInit {
  @Input() customer: Customer;
  @Output() close = new EventEmitter();
  error: any;
  navigated = false; // true if navigated here

  public order_units: Array<Object> = [];

  public added_unit:string = "";

  public selected_devices: number[];

  private sub: any;
  
  public delete_warning = false;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

public closeAlert(i:number):void {
		this.order_units.splice(i, 1);
	}
	public addAlert():void {
    if(this.added_unit == "") {
      return;
    }
    if(this.order_units.length == this.customer.quantity) {
      alert("You've tried to add " + (this.customer.quantity + 1).toString() + " units to an order of " + this.customer.quantity.toString() + " units");
      return;
    }
    if(this.order_units.indexOf(this.added_unit) >= 0) {
      alert("You've tried to add duplicate units");
      return;
    }
		this.order_units.push({msg: this.added_unit, type: 'success', closable: true});
    var index = this.customer.available_devices.indexOf(this.added_unit);
    this.customer.available_devices.splice(index,1);
	}

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      if(params['id'] !== undefined){
        let id = +params['id'];
        this.navigated = true;
        this.customerService.getCustomer(id)
          .subscribe((customer:Customer) => {
            this.customer = customer;
            if(this.customer.order_date) {
              this.customer.order_date = new Date(this.customer.order_date).toDateString();
            }
          })
      }
      else{
        this.navigated = false;
        this.customer = new Customer();
      }
    })
  }

  public save(){
    if(this.customer.customerID){
      this.customerService.updateCustomer(this.customer)
      .subscribe((customer:Customer) => {
        this.customer = customer;
        this.goBack();
      });

    }
    else{
      this.customerService.addCustomer(this.customer)
      .subscribe((customer:Customer) => {
        this.customer = customer;
        this.goBack();
      });
    }
  }

  setSelectedDevices(selectElement: any[]) {
    this.selected_devices = Array();
    for(var i = 0; i < selectElement.length; i++) {
      if(selectElement[i].selected) {
        this.selected_devices.push(selectElement[i].value);
      }
    }
    console.log(this.selected_devices);
  }

  goBack() { this.router.navigate(['/dashboard/customers']); }

  // ngOnDestroy() {
  //   this.sub.unsubscribe()
  // }

}
