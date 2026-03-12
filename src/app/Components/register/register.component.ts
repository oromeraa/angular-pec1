import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { SharedService } from 'src/app/Services/shared.service';
import { UserService } from 'src/app/Services/user.service';

import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserDTO } from 'src/app/Models/user.dto';
import { formatDate } from '@angular/common';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';

type RegisterFormModel = {
  name: FormControl<string>;
  surname_1: FormControl<string>;
  surname_2: FormControl<string>;
  alias: FormControl<string>;
  birth_date: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  // TODO: implementar tipo RegisterFormModel 

  // TODO 16
  registerUser: UserDTO;

  name: FormControl<string>;
  surname_1: FormControl<string>;
  surname_2: FormControl<string>;
  alias: FormControl<string>;
  birth_date: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;

  registerForm: FormGroup<RegisterFormModel>;
  isValidForm: boolean | null;


  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private headerMenusService: HeaderMenusService,
    private router: Router,
  ) {
    // TODO 17
    this.registerUser = new UserDTO('', '', '', '', new Date(), '', '');
    this.isValidForm = null;


    this.name = this.formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(25)],
      nonNullable: true,
    });

    this.surname_1 = new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(25)],
      nonNullable: true,
    });

    this.surname_2 = new FormControl('', {
      validators: [Validators.minLength(5), Validators.maxLength(25)],
      nonNullable: true,
    });

    this.alias = new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(25)],
      nonNullable: true,
    });

    this.birth_date = new FormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en'), {
      validators: [Validators.required],
      nonNullable: true,
    });

    this.email = new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    });

    this.password = new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(16)],
      nonNullable: true,
    });

    this.registerForm = this.formBuilder.group({
      name: this.name,
      surname_1: this.surname_1,
      surname_2: this.surname_2,
      alias: this.alias,
      birth_date: this.birth_date,
      email: this.email,
      password: this.password,
    });

  }

  ngOnInit(): void { }

  async register(): Promise<void> {
    let responseOK = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.registerForm.invalid) {
      return;
    }

    this.isValidForm = true;

    const raw = this.registerForm.getRawValue();

    // Convertir birth_date (string yyyy-MM-dd) a Date
    const birthDate = new Date(raw.birth_date);

    // surname_2: si viene vacío, pasamos string vacío para cumplir constructor
    const surname2 = raw.surname_2 ?? '';

    this.registerUser = new UserDTO(
      raw.name,
      raw.surname_1,
      surname2,
      raw.alias,
      birthDate,
      raw.email,
      raw.password,
    );

    try {
      await this.userService.register(this.registerUser);
      responseOK = true;
    } catch (error: any) {
      responseOK = false;
      errorResponse = error.error;

      const headerInfo: HeaderMenus = {
        showAuthSection: false,
        showNoAuthSection: true,
      };
      this.headerMenusService.headerManagement.next(headerInfo);

      this.sharedService.errorLog(errorResponse);
    }

    await this.sharedService.managementToast(
      'registerFeedback',
      responseOK,
      errorResponse,
    );

    if (responseOK) {
      this.registerForm.reset();

      // Volver a setear el birth_date por defecto
      this.birth_date.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en'));

      this.router.navigateByUrl('home');
    }
  }
}
