import { SelectItem } from 'primeng/components/common/selectitem';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient} from '@angular/common/http';
import {RegisterUser} from "../../domain/registeruser";


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  userform: FormGroup;
  submitted: boolean;
  ciudad: SelectItem[];
  firstTime: boolean;
  registerSubscription: Subscription;
  file: File;
  finalFile: String;
  msgs: any[];
  selectedFile: File;

  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private fb: FormBuilder, private router: Router, private registerService: RegisterService) {
  }

  ngOnInit() {
    this.msgs = [];
    this.firstTime = true;
    this.userform = this.fb.group({
        'email': new FormControl('', Validators.compose([Validators.required, Validators.email])),
        'password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        'ciudad': new FormControl('', Validators.required),
        'pais': new FormControl('', Validators.required),
        'first_name': new FormControl('', Validators.required),
        'last_name': new FormControl('', Validators.required),
        'direccion': new FormControl('', Validators.required),
        'foto': new FormControl(null),
        'favoritas': new FormControl('')

    });
    this.ciudad = [];
    this.ciudad.push({label:'Seleccionar una Ciuidad', value:''});
    this.ciudad.push({label:'Bogotá', value:1});
    this.handleAuth();
  }



  onSubmit(value: string) {
    if ( this.userform.valid ) {
      const registerUser: RegisterUser = {
        email: this.userform.value.email,
        first_name: this.userform.value.first_name,
        last_name: this.userform.value.last_name,
        pais: this.userform.value.pais,
        ciudad: this.userform.value.ciudad,
        direccion: this.userform.value.direccion,
        favoritas: this.userform.value.favoritas,
        password: this.userform.value.password,
        foto: this.selectedFile
      };

      this.registerService.register(registerUser);
      this.router.navigateByUrl('sign-in')
    }
    this.submitted = true;
  }



  onFileChange(event) {
    if(event.target && event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
    /*
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.finalFile = reader.result.split(',')[1];
        console.log('DataURL:', reader.readAsDataURL(this.file));
        //this.finalFile = reader.result;
        //this.userform.get('foto').setValue)
        //this.userform.get('Foto').setValue({
        //value: reader.result.split(',')[1]
        //})
      };
    }*/
  }

  private handleAuth(): void {
    this.registerSubscription = this.registerService.isRegistered.subscribe(authStatus => {
      if ( authStatus ){
        this.msgs.push({severity:'info', summary:'Registro Exitoso', detail:'Ya estas Registrado, Puedes ingresar por el login'});
      }
      else {
        this.submitted = false;
        if ( !this.firstTime ){
          this.msgs.push({severity:'danger', summary:'Falló el Registro', detail:'Algun campo que ingresaste no es valido'});
        }
        this.firstTime = false;
      }
    });
  }

}
