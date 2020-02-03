import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  model: string;
  json: string;
  jsonData: any;
  keys: Array<string>;
  ymlFile: string;
  parents: any = {};
  count: number;
  models: any = {};
  jsonLabel: Object = {};

  downLoadFile(data: any, type: string) {
    const blob = new Blob([data], { type: type.toString() });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
}

  generateYML() {
    this.jsonLabel["english"] = {};
    this.jsonLabel["khmer"] = {};
    this.ymlFile = '';
    this.jsonData = JSON.parse(this.json);
    this.keys = Object.keys(this.jsonData);
    this.keys.forEach(key => {
      this.writeOnToFile(this.jsonData[key]);
    });
    console.log(this.ymlFile);
    this.downLoadFile(this.ymlFile, 'yaml');
    console.log(this.jsonLabel);
    this.downLoadFile(JSON.stringify(this.jsonLabel), 'txt');
  }

  private writeOnToFile(form) {
    form.forEach(component => this.pushParent(component));
    form.forEach(component => this.convertComponentToYML(component));
  }

  private pushParent(component: YMLComponent) {
    const ele = component.number.split('.');
    this.models[component.number] = this.model + '.' + component.fieldId;
    if (ele.length > 1) {
      this.parents[component.number] = this.models[ele[0]];
    }
  }

  private convertComponentToYML(component: YMLComponent) {
    this.writeHeading();
    component.fieldId && this.writeFieldId(component.fieldId);
    component.validation && this.writeValidation(component.validation);
    this.writeModel(component.fieldId);
    this.writeParent(component);
    this.writeVisible(component);
    this.writeLabel(component);
    this.writeAnswer(component);
    this.writeKhhmerLabel(component);
    this.writeOptionsOnYml(component);
  }

  private writeOptionsOnYml(component: YMLComponent) {
    if (component.answer && component.khmerAnswer) {
      this.writeYml('options:');
      const jsonOptions = this.splitAndReturnAnswers(component);
      Object.keys(jsonOptions[0]).forEach(ele => {
        this.writeYml(' - data: ' + jsonOptions[0][ele].split(" ").slice(0, 2).join(''));
        this.writeYml('   optionId: "' + jsonOptions[0][ele].trim().split(" ").slice(0, 2).join('') + '"');
      });
    }
  }


  private writeVisible(component: YMLComponent) {
    if (this.parents[component.number]) { this.writeYml('visible: ' + this.parents[component.number]); } else { this.writeYml('visible:  ' + 'true'); }
  }

  private writeModel(value) {
    this.writeYml('model: ' + this.model + '.' +  value);
  }

  private writeValidation(validation: string) {
    const validationElements = this.split(validation, '\r\n');
    validationElements.forEach((ele) => {
      this.writeValidationCondition(ele);
    });
  }

  private writeAnswer(component: YMLComponent) {
    if (component.answer && component.khmerAnswer) {
      const jsonOptions = this.splitAndReturnAnswers(component);
      this.jsonLabel["english"][component.fieldId] = {
          ...this.jsonLabel["english"][component.fieldId],
          "options" : {
            ...jsonOptions[0]
          }
        };
      this.jsonLabel["khmer"][component.fieldId] = {
        ...this.jsonLabel["khmer"][component.fieldId],
        "options": {
          ...jsonOptions[1]
        }
      };
    }
  }

  private splitAndReturnAnswers(component: YMLComponent) {
      const optionId = this.split(component.answer, '\r\n');
      return [
        this.arrayToJSON(this.split(component.answer, '\r\n').map((ele, index) => {
          return this.getJson(ele, optionId[index] === 1 ? undefined : optionId[index].split('.').slice(1).join(''));
        })),
        this.arrayToJSON(this.split(component.khmerAnswer, '\r\n').map((ele, index) => {
          return this.getJson(ele,optionId[index] === 1 ? undefined : optionId[index].split('.').slice(1).join(''));
        }))
      ];
  }

  private arrayToJSON(array){
    let json = {};
    array.forEach(element => {
      json = {
        ...(json as Object),
        ...element
      };
    });
    return json;
  }

  private getJson(ele, optionId?: string) {
    const e = {};
    if (ele.split(".").length === 1) return {}; 
    let key = optionId ? optionId.trim().split(" ").slice(0, 2).join('') : ele.split('.')[1].trim();
    key = key.trim();
    e[key] = ele.split('.')[1].trim();
    return e;
  }

  private writeParent(component: YMLComponent) {
    if (this.parents[component.number]) {
    this.writeYml('parent: ' + this.parents[component.number]);
    }
  }

  private writeKhhmerLabel(component: YMLComponent) {
    this.jsonLabel["khmer"][component.fieldId] = {
      ...this.jsonLabel["khmer"][component.fieldId],
      "label": component.khmerLabel
    }
  }

  private writeLabel(component: YMLComponent) {
    this.writeYml('label: "' + component.question + '"');
    this.jsonLabel["english"][component.fieldId] = {
      ...this.jsonLabel["english"][component.fieldId],
      "label": component.question
    }
  }

  private writeHeading() {
    this.ymlFile = this.ymlFile + '\n- ';
  }

  private writeFieldId(value) {
    this.writeYml('fieldId: ' + value );
  }

  private writeValidationCondition(validaion: string) {
    switch (validaion) {
      case 'Mandatory': this.writeYml('required: ' + 'true');
                        break;
      case 'Yes/No': this.writeYml('id: yesOrNo');
                     break;
      case 'Dropdown option (Allow multiple selections)': this.writeYml('type: "multislect"');
                                                          break;
      case 'Dropdown option (Single selection only)': this.writeYml('type: "select"');
                                                      break;

    }
  }

  private writeYml(context: string) {
    this.ymlFile = '\t' + this.ymlFile + context + '\n ';
  }

  private split(value , pattern): Array < any > {
    return value.split(pattern);
  }
}

interface YMLComponent {
  fieldId: string;
  validation: string;
  answer: string;
  khmerLabel: string;
  question: string;
  khmerAnswer: string;
  number: any;
}
