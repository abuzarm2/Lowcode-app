import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalService } from 'src/app/_modal/modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  NgForm,
} from '@angular/forms';
import { Arr } from 'src/app/model';

/**
 * @title Basic expansion panel
 *
 */
import * as $ from 'jquery';
interface Lan {
  value: string;
  viewValue: string;
}
interface Car {
  value: string;
}
@Component({
  selector: 'app-oa',
  templateUrl: './oa.component.html',
  styleUrls: ['./oa.component.css'],
})
export class OAComponent {
  lan: Lan[] = [
    { value: 'Java', viewValue: 'Java' },
    { value: 'JavaScript', viewValue: 'JavaScript' },
    { value: 'C#', viewValue: 'C#' },
  ];
  language: string;
  functions = [];
  enhanceflag = false;
  table_generated = false;
  firstScreen: boolean = true;
  secondScreen: boolean = false;
  thirdScreen: boolean = false;

  runs = 0;
  map_col = {};
  arr: Arr = { Factors: '0', Levels: '0' };
  addForm: FormGroup;
  displayedColumns = [];
  names_factor = [];

  //rows
  rows = [];
  rows1 = [];
  rows2 = [];

  //flags
  flag = false;
  flagoa = false;
  flagnext = true;
  flagrefresh = false;
  one_time_flag = false;
  flag_table: boolean = false;
  feature_file_flag = false
  step_file_flag = false


  feature = '';
  Scenerio = '';
  tag = '';
  file_content = '';
  step_content = ''
  content = {};
  id: string = '';
  Factors = 0;
  Pre_Requisite = '';
  Post_Requisite = '';
  Number_of_factor: string = '0';
  onscreen = [];
  obj: any;
  fetched_list = [];
  radio_list = [];
  SelectedItem = '';
  Fac = 0;
  data: Array<{}> = [];

  previous_state = [];
  typeSelected: string;
  spinner_flag = false;
  query: string = '';
  suggestions: string[] = [];

  /**Initializing row as array of form builder*/
  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private modalService: ModalService,
    private spinnerService: NgxSpinnerService
  ) {
    this.typeSelected = 'ball-fussion';
  }
  Home() {
    this.initialise_back_to_home();
  }
  onAddRow() {
    this.rows1.push({
      pre: '',
      pre_variables: '',
      pre_values: '',
      selectedCar: '',
    });
  }
  onAddRow2() {
    this.rows2.push({
      post: '',
      post_variables: '',
      post_values: '',
      selectedCar: '',
    });
  }

  onRemoveRow() {
    this.rows1.pop();
  }
  onRemoveRow2() {
    this.rows2.pop();
  }

  initialise_back_to_home() {
    this.table_generated = false;
    this.firstScreen = true;
    this.secondScreen = false;
    this.map_col = {};
    this.displayedColumns = [];
    this.rows = [];
    this.rows1 = [];
    this.rows2 = [];
    this.flagoa = false;
    this.flagnext = true;
    this.id = '';
    this.Factors = 0;
    this.Number_of_factor = '0';
    this.onscreen = [];
    this.obj = {};
    this.fetched_list = [];
    this.radio_list = [];
    this.displayedColumns = [];
    this.data = [];
    this.flag_table = false;
    this, (this.one_time_flag = false);
  }
  /**Adding rows to form group */

  ngOnInit() {}

  /**Getting the factor value and generating columns based on Factor value*/
  onSave() {
    this.Pre_Requisite = '';
    this.Post_Requisite = '';
    this.Scenerio = '';
    this.tag = '';
    this.feature = '';
    for (let index = 0; index < Number(this.Factors); index++) {
      this.displayedColumns.push(String(index));
    }

    this.firstScreen = false;
    this.secondScreen = true;
    console.log(this.displayedColumns);

    for (let i = 0; i < Number(this.Factors); i++) {
      this.rows.push({
        Factor_name: '',
        Level_count: '',
        Level_value: [],
        Level_values: '',
      });
    }
  }

  refresh() {
    for (let index = 0; index < Number(this.Factors); index++) {
      this.rows[index].Factor_name = this.previous_state[index].Factor_name;
      this.rows[index].Level_count = this.previous_state[index].Level_count;
      this.rows[index].Level_value = [];
      this.rows[index].Level_values = '';
    }
  }
  display() {
    // for (let i = 0; i < Number(this.Factors); i++) {
    //   for (let j = 0; j < Number(this.rows[i].Level_count); j++) {
    //     this.rows[i].Level_value.push({ value: '0' });
    //   }
    // }

    console.log('rows values:');
    console.log(this.rows);

    this.flag = true;
    this.flagoa = true;
    this.flagnext = false;
    $('.inputId').prop('readonly', true);
    this.flagrefresh = false;
  }

  /**used to create element of form array*/
  emptylist() {
    if (this.flagnext == true) {
      this.previous_state = this.rows;
      $('.inputId').val(' ');
      this.rows = [];
      this.displayedColumns = [];
      this.onSave();
    } else if (this.flagoa == true) {
      $('.inputlevels').val(' ');
      for (let i = 0; i < Number(this.Factors); i++) {
        this.rows[i].Level_value = [];
      }
      for (let i = 0; i < Number(this.Factors); i++) {
        for (let j = 0; j < Number(this.rows[i].Level_count); j++) {
          this.rows[i].Level_value.push({ value: '' });
        }
      }
    }
    this.flagrefresh = true;
  }
  sleep(milliseconds: number) {
    let resolve: any;
    let promise = new Promise((_resolve) => {
      resolve = _resolve;
    });
    setTimeout(() => resolve(), milliseconds);
    return promise;
  }

  closetable() {
    for (let index = 0; index < this.rows.length; index++) {
      this.rows[index].Level_values = '';
    }
    this.flag_table = false;
    this.table_generated = false;
    this.flagoa = true;
    this.data = [];
    this.one_time_flag = false;
  }

  backfunction() {
    if (this.flagoa == true) {
      $('.inputlevels').val('0');

      for (let i = 0; i < Number(this.Factors); i++) {
        this.rows[i].Level_count = '';
      }
      for (let i = 0; i < Number(this.Factors); i++) {
        this.rows[i].Level_value = [];
      }
      // console.log('data:');
      // console.log(this.data);
      // console.log('row value:');
      // console.log(this.rows);
      this.flagoa = false;
      this.flagnext = true;

      this.onscreen = [];
      this.map_col = {};
      this.obj = {};
      this.fetched_list = [];
      this.radio_list = [];

      this.data = [];
      this.flag_table = false;
      $('.inputId').prop('readonly', false);
    } else if (this.flagnext == true) {
      $('.inputId').val(' ');
      this.rows = [];
      this.displayedColumns = [];
      this.firstScreen = true;
      this.secondScreen = false;
      this.onscreen = [];
      this.map_col = {};
      this.obj = {};
      this.fetched_list = [];
      this.radio_list = [];
      this.displayedColumns = [];
      this.data = [];
      this.flag_table = false;
    }
  }

  CreateOA(id: string) {
    // this.spinnerService.show();
    // this.spinner_flag = true;

    if (this.one_time_flag == false) {
      for (let i = 0; i < this.rows.length; i++) {
        for (let j = 0; j < this.rows[i].Level_value.length; j++) {
          this.rows[i].Level_values += this.rows[i].Level_value[j].value;
          this.rows[i].Level_values += ',';
        }
        this.rows[i].Level_values = this.rows[i].Level_values.slice(
          0,
          this.rows[i].Level_values.length - 1
        );
      }
      this.one_time_flag = true;
    }

    console.log('factor name , Level count , Level Values');
    console.log(this.rows);

    this.id = id;
    let count = {};
    for (let index = 0; index < this.rows.length; index++) {
      let s = this.rows[index]['Level_values'].split(',').length;
      if (s in count) {
        let temp = count[s];
        temp = temp + 1;
        count[s] = temp;
      } else {
        count[s] = 1;
      }
    }

    // console.log('count dic is :');
    // console.log(count);
    let str = '';
    for (let key in count) {
      str += key;
      str = str + '^' + String(count[key]);
      str += ' ';
    }
    str = str.slice(0, str.length - 1);

    for (let index = 0; index < this.rows.length; index++) {
      let temp = this.rows[index].Factor_name;
      this.onscreen.push(temp);
      this.map_col[this.displayedColumns[index]] = this.onscreen[index];
    }
    console.log('onscreen:' + this.map_col);
    console.log(str);
    this.http
      .post('http://127.0.0.1:8000/', {
        row: this.rows,
        pattern: str,
      })
      .subscribe((data) => {
        this.obj = data;
        console.log('in subscribe');
        if (this.obj) {
          if (this.obj.result[0] == false) {
            this.fetched_list = this.obj.result[1];
            this.radio_list = [];
            for (let index = 0; index <= 2; index++) {
              this.radio_list.push(this.fetched_list[index]['id']);
            }
            this.spinnerService.hide();
            this.modalService.open(this.id);
          } else {
            this.spinnerService.hide();
            this.submit();
          }
        }
      });
    // console.log(this.obj);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  submit() {
    let s = '';
    console.log('selectedItem:');
    console.log(this.SelectedItem);
    if (this.obj.result[0] == false) {
      for (let index = 0; index < this.fetched_list.length; index++) {
        if (this.fetched_list[index]['id'] == this.SelectedItem) {
          console.log('fetched_list[index]:');
          console.log(this.fetched_list[index]);
          if (
            this.fetched_list[index]['F_factor'] -
              this.fetched_list[index]['E_index'] ==
            0
          ) {
            s = this.fetched_list[index]['tab'];
          } else {
            this.Fac = this.fetched_list[index]['F_factor'];
            // console.log('type');
            // console.log(typeof this.fetched_list[index]['E_factor']);
            let E = this.fetched_list[index]['F_factor'];
            let F = this.fetched_list[index]['E_factor'];

            let removing_col = E - F;
            // console.log('removingcol:');
            // console.log(removing_col);
            let new_ = this.fetched_list[index]['tab'].split('\n');
            new_.pop();

            // console.log('new_');
            // console.log(new_);

            for (let i = 0; i < new_.length; i++) {
              s += new_[i].slice(0, new_[i].length - removing_col);
              s += '\n';
              // console.log('x:');
              // console.log(s);
            }
          }
          break;
        }
      }
    } else {
      s = this.obj.result[2];
    }
    // console.log(' s new:');
    // console.log(s);
    if (this.obj.result[0]) {
    } else {
      let new_fac = this.Fac;
      for (let i = 0; i < this.rows.length; i++) {
        console.log('rowssss');
        console.log(this.rows);
        if (this.rows[i].Level_values.split(',').length < new_fac) {
          console.log(this.rows[i].Level_values.split(','));
          for (
            let j = 0;
            j < new_fac - this.rows[i].Level_values.split(',').length;
            j++
          ) {
            this.rows[i].Level_values += ',~';
            console.log('new row:');
            console.log(this.rows[i]);
          }
        }
      }
    }
    console.log('row.value:');
    console.log(this.rows);
    // console.log('s:');
    // console.log(s);
    let list = s.split('\n');

    const runs = list.length;
    // console.log(this.rows);

    for (let index = 0; index < runs; index++) {
      let d = {};
      for (let j = 0; j < list[index].length; j++) {
        d[String(j)] = this.rows[j]['Level_values'].split(',')[list[index][j]];
      }
      this.data.push(d);
    }

    this.data.pop();

    //get factor names to print in file
    this.names_factor = [];
    this.rows.forEach((element) => {
      this.names_factor.push(element['Factor_name']);
    });

    console.log('Data:');
    console.log(this.data);
    console.log('columns:');
    console.log(this.displayedColumns);
    console.log('row names:');
    console.log(this.names_factor);

    // Saving the table data(dictionary) in local
    this.table_generated = true;
    this.flag_table = true;
    this.modalService.close(this.id);
    // console.log('flag table:');
    // console.log(this.flag_table);

    // console.log('map:');
    // console.log(this.map_col);
    this.runs = this.data.length;
  }

  // Add test cases to table
  addtestcase() {
    let data = {};
    for (let i = 0; i < this.displayedColumns.length; i++) {
      data[this.displayedColumns[i]] = '';
    }
    data['isEdit'] = true;
    this.data = [...this.data, data];
    this.runs = this.data.length;
  }
  deleteLastRow() {
    if (this.data.length > 0) {
      this.data.pop();
      this.runs = this.data.length;
      this.reloadTable()
      console.log(this.data);
    }
  }
  reloadTable() {
    this.cdr.detectChanges(); // Manually trigger change detection
  }
  deleteRow(row: any) {
    const index = this.data.indexOf(row);
    console.log(index)
    if (index > -1) {
      this.data.splice(index, 1);
    }
    console.log(this.data);
  }

  step(id: string, id2: string) {
    this.http
      .post('http://127.0.0.1:8000/stepdefination', {
        file_data: this.file_content,
        lang: this.language,
        dropdown: [],
      })
      .subscribe((data) => (this.content = data));
    this.sleep(3000).then(() => {
      if (this.content) {
        this.step_content = this.content['file_content'];
        console.log('Bdd Step Definition');
        console.log(this.step_content);
        this.modalService.close(id);
        this.modalService.open(id2);
        this.step_file_flag = true
      }
    });
  }
  enhanced_step(id: string) {
    this.http
      .post('http://127.0.0.1:8000/enhanced_step_def', {
        pre_req: this.rows1,
        post_req: this.rows2,
        language: this.language,
        flag: true,
      })
      .subscribe((data) => (this.content = data));
    this.sleep(3000).then(() => {
      if (this.content) {
        this.step_content = this.content['file_content'];
        console.log('Bdd1 Step Definition');
        console.log(this.step_content);
        this.modalService.open(id);
      }
    });
  }
  Report_open(id: string) {
    this.http.post('http://127.0.0.1:8000/report', {}).subscribe();
  }
  enhance(id: string) {
    let temp_row = {};
    this.modalService.close(id);
    this.enhanceflag = true;
    $('.inputId').prop('readonly', true);
    this.http
      .post('http://127.0.0.1:8000/enhance', {})
      .subscribe((data) => (temp_row = data));
    this.sleep(3000).then(() => {
      console.log('dropdown');
      console.log(temp_row);
      this.functions = temp_row['result'];
    });

  }
  Integrate() {
    this.http.post('http://127.0.0.1:8000/integrate', {}).subscribe();
  }

  automaticfill_pre_post() {
    let temp_row = {};
    this.http
      .post('http://127.0.0.1:8000/automatic_pre_post', {
        row1: this.rows1,
        row2: this.rows2,
      })
      .subscribe((data) => (temp_row = data));

    this.sleep(3000).then(() => {
      for (let index = 0; index < this.rows1.length; index++) {
        this.rows1[index]['pre'] = temp_row['result_pre'][index];
      }
      for (let index = 0; index < this.rows2.length; index++) {
        this.rows2[index]['post'] = temp_row['result_post'][index];
      }
      this.tag = temp_row['tag'];
      this.Scenerio = temp_row['scenerios'];
      this.feature = temp_row['feature'];
    });
  }

  // Auto Suggestion code
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.query = input.value;

    console.log('query ' + this.query);
    this.fetchSuggestions();
  }

  fetchSuggestions() {
    // Call your API or database here to fetch suggestions based on this.query
    // For example, using an API with HttpClient:
    let temp_row = {};
    this.http
      .post('http://127.0.0.1:8000/suggestions', {
        query: this.query,
      })
      .subscribe((response) => {
        temp_row = response;
        this.suggestions = temp_row['result'][1];
        console.log('Temp row:\n');
        console.log(temp_row);
        console.log(this.suggestions);
      });
  }

  selectSuggestion(suggestion: string) {
    this.query = suggestion;
    this.suggestions = []; // Clear suggestions after selection
  }

  automaticfill() {
    let temp_row = {};
    this.http
      .post('http://127.0.0.1:8000/automatic', {
        row: this.rows,
      })
      .subscribe((data) => (temp_row = data));
    this.sleep(3000).then(() => {
      for (let index = 0; index < temp_row['result'].length; index++) {
        for (
          let inner_index = 0;
          inner_index < this.rows[index].Level_value.length;
          inner_index++
        ) {
          this.rows[index]['Level_value'][inner_index].value =
            temp_row['result'][index][inner_index];
        }
      }
    });
  }

  bdd() {
    this.secondScreen = false;
    this.thirdScreen = true;
    // this.onAddRow();
    // this.onAddRow2();
  }

  // generate feature file
  generate_feature() {
    let factor_names = [];
    let temp = [];
    for (let index = 0; index < this.displayedColumns.length; index++) {
      factor_names.push(this.map_col[this.displayedColumns[index]]);
    }

    // console.log('factors');
    // console.log(factor_names);
    this.http
      .post('http://127.0.0.1:8000/bdd', {
        names_factor: this.names_factor,
        table_data: this.data,
        column_data: factor_names,
        pre_req: this.rows1,
        post_req: this.rows2,
        scenerio: this.Scenerio,
        tag: this.tag,
        feature: this.feature,
      })
      .subscribe((data) => (this.content = data));

    this.sleep(3000).then(() => {
      if (this.content) {
        alert(this.content['message']);
        this.file_content = this.content['file_content'];
      }
    });
  }

  // display feature file
  display_feature(id: string) {
    // to store steps if not in included in suggestions
    this.http
      .post('http://127.0.0.1:8000/store_suggestions', {
        pre_req: this.rows1,
        post_req: this.rows2,
      })
      .subscribe();

    console.log('file_content');
    console.log(this.file_content);
    this.feature_file_flag = true
    this.modalService.open(id);
  }

  generate(id: string) {
    this.id = id;
    let count = {};
    for (let index = 0; index < this.rows.length; index++) {
      let s = this.rows[index]['Level_values'].split(',').length;
      if (s in count) {
        let temp = count[s];
        temp = temp + 1;
        count[s] = temp;
      } else {
        count[s] = 1;
      }
    }
    console.log('count dic is :');
    console.log(count);
    let str = '';
    for (let key in count) {
      str += key;
      str = str + '^' + String(count[key]);
      str += ' ';
    }
    str = str.slice(0, str.length - 1);

    for (let index = 0; index < this.rows.length; index++) {
      let temp = this.rows[index]['Factor_name'];
      this.onscreen.push(temp);
      this.map_col[this.displayedColumns[index]] = this.onscreen[index];
    }
    console.log('onscreen:' + this.map_col);
    this.http
      .post('http://127.0.0.1:8000/', {
        pattern: str,
      })
      .subscribe((data) => (this.obj = data));
    console.log(this.obj);
    //
    if (this.obj) {
      this.fetched_list = this.obj.result[1];

      for (let index = 0; index <= 2; index++) {
        this.radio_list.push(this.fetched_list[index]['id']);
      }
      console.log('radio_list:');
      console.log(this.radio_list);
      this.modalService.open(id);
    }
  }

  // Get input Data
  getInputData() {
    this.http
      .post('http://127.0.0.1:8000/get_inputdata', {})
      .subscribe((data) => {
        if (data['rows']) {
          console.log('recieved data:');
          console.log(data['rows']);

          // this.rows = JSON.parse(JSON.stringify(data['rows']));
          this.rows = data['rows'];
          // console.log(this.rows)

          this.firstScreen = false;
          this.secondScreen = true;

          this.Pre_Requisite = '';
          this.Post_Requisite = '';
          this.Scenerio = '';
          this.tag = '';
          this.feature = '';
          this.Factors = data['rows'].length;

          for (let index = 0; index < Number(data['rows'].length); index++) {
            this.displayedColumns.push(String(index));
          }

          // for (let i = 0; i < Number(this.Factors); i++) {
          //   for (let j = 0; j < Number(this.rows[i].Level_count); j++) {
          //     this.rows[i].Level_value.value = this.rows[i].Level_value[j]
          //   }
          // }

          this.flag = true;
          this.flagoa = true;
          this.flagnext = false;
          $('.inputId').prop('readonly', true);
          this.flagrefresh = false;
          this.one_time_flag = false;
        } else if (data['message']) alert(data['message']);
      });
  }

  // Add Ui objects
  addUiObjects() {
    this.rows.push({
      Factor_name: '',
      Level_count: '',
      Level_value: [],
      Level_values: '',
    });
    this.displayedColumns.push(String(this.Factors));
    this.Factors = Number(this.Factors) + 1;
  }
  // Remove Ui objects
  removeUiObjects() {
    this.rows.pop();
    this.Factors = Number(this.Factors) - 1;
    this.displayedColumns.pop();
  }

  // Add UI values
  addUIValues(event: Event, index: number) {
    var num = 0;
    const input = event.target as HTMLInputElement;
    num = Number(input.value);
    console.log(num);
    console.log(index);
    this.rows[index].Level_value = [];
    for (let j = 0; j < Number(this.rows[index].Level_count); j++) {
      this.rows[index].Level_value.push({ value: '0' });
    }
    console.log(this.rows);
  }

  // back button to second screen
  backtosecondscreen() {
    this.secondScreen = true;
    this.thirdScreen = false;
    // this.onRemoveRow();
    // this.onRemoveRow2();
  }

  // save all datas
  save_data() {
    this.http
      .post('http://127.0.0.1:8000/save_data', {})
      .subscribe((data) => {});
  }

  // Add test cases
  onInputChange_table(element: any) {
    // Check if all properties in element have values
    const hasValues = Object.values(element).every((value) => value !== '');

    if (hasValues) {
      const existingIndex = this.data.indexOf(element);
      if (existingIndex >= 0) {
        const newRow = { ...element, isEdit: false };
        this.data.splice(existingIndex, 1); // Remove the existing row
        this.data.push(newRow); // Append the modified row to the end
      }
    }
  }
}
