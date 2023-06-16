import pandas as pd
import json
import requests
import re
import os
from django.http import HttpResponse
import webbrowser
from pymongo import MongoClient
import csv
from django.views.decorators.csrf import csrf_exempt
import tkinter as tk
from tkinter import filedialog
home_dir = os.path.expanduser("~")
feature_file = None
directory = ''
dictionary = []

all_content = {
    'directory' : '',
    'dictionary' : [],
    'fieldnames' : [],
    'table_dictionary' : [],
    'feature_string' : '',
    'scenario_string' : ''
}

def func_generator_js(keyword,argument,result_file):
    func1=''
    if 'launch' in argument.split(" ") and keyword=="Given":
        func1='ApplicationLaunch()'
    if 'logout' in argument.split(" ") and keyword=="And":
        func1='ApplicationExit()'
    if 'login' in argument.split(" ") and keyword=="When":
        func1='ApplicationLogin()'
    structure=keyword+'(\''+argument.strip()+'\',()=>{'+'\n'+ func1 +'\n'+'})'+'\n'
    result_file.write(structure)

def func_generator_java(keyword,argument,o_w_f='',param='',returnparam='',flag=False):
    if flag==True:
        if returnparam == 'nan':
            returnparam=''
        else:
            o_w_f=returnparam+'='+o_w_f
        if param=='nan':
            param=''
        structure='@'+keyword+'(\"^'+argument.strip()+'$\")\n\t'+'public void '+argument.replace(" ", "_")[1:]+'() throws InterruptedException { '+'\n\t\t'+o_w_f+'('+param+')\n\n\t}\n\n\t'
    else:
        structure='@'+keyword+'(\"^'+argument.strip()+'$\")\n\t'+'public void '+argument.replace(" ", "_")[1:-1]+'() throws InterruptedException { \n\n\t'+returnparam+'}\n\n\t'
    all_content['scenario_string']+=structure

def func_generator_cs(keyword,argument,result_file):
    structure='['+keyword+'(@\"'+argument.strip()+'\")]\n\t\t'+'public void '+keyword+argument.replace(" ", "")+'() \n\t\t{\n\n\t\t}\n\n\t\t'
    result_file.write(structure)

def func_generator_with_variable_cs(keyword,line,result_file):
    preced_place_holder=""
    variable_string="("
    removing_word_list=[]
    removing_word_list.append(keyword)
    removing_word_list.append(',')
    for data in re.findall("<[A-Za-z_0-9]*>", line):
        preced_place_holder=preced_place_holder+"\"\"([^\"\"]*)\"\","
        variable_string=variable_string+'String '+data[1:-1]+','
        temp="\"<"+data[1:-1]+">\""
        removing_word_list.append(temp)
    preced_place_holder=preced_place_holder[:-1]
    variable_string=variable_string[:-1]+')'
    for rem in removing_word_list:
        if rem in line:
            line=line.replace(rem,"")
    structure='['+keyword+'(@\"'+line.strip()+preced_place_holder+'\")]\n\t\t'+'public void '+keyword+line.replace(" ", "")+variable_string+' \n\t\t{\n\n\t\t}\n\n\t\t'
    result_file.write(structure)

def func_generator_with_variable_java(keyword,line):
    preced_place_holder=""
    variable_string="("
    removing_word_list=[]
    removing_word_list.append(keyword)
    removing_word_list.append(',')
    for data in re.findall("<[A-Za-z_0-9]*>", line):
        preced_place_holder=preced_place_holder+"(.*)"
        variable_string=variable_string+'String '+data[1:-1]+','
        temp="\"<"+data[1:-1]+">\""
        removing_word_list.append(temp)
    variable_string=variable_string[:-1]+')'
    for rem in removing_word_list:
        if rem in line:
            line=line.replace(rem,"")
    structure='@'+keyword+'(\"^'+line.strip()+preced_place_holder+'$\")\n\t'+'public void '+line.replace(" ", "_")[1:-1]+variable_string+' throws InterruptedException {\n\n\t}\n\t\n\t'
    all_content['scenario_string'] +=structure

def func_generator_with_variable_js(keyword,line,result_file,func1):
    variable_string="("
    removing_word_list=[]
    removing_word_list.append(keyword)
    removing_word_list.append(',')
    preced_place_holder=""
    for data in re.findall("<[A-Za-z_0-9]*>", line):
        preced_place_holder=preced_place_holder+"{"+"string"+"},"
        variable_string=variable_string+data[1:-1]+','
        temp="\"<"+data[1:-1]+">\""
        removing_word_list.append(temp)
    preced_place_holder=preced_place_holder[:-1]
    variable_string=variable_string[:-1]+')'
    for rem in removing_word_list:
        if rem in line:
            line=line.replace(rem,"")
    structure=keyword+'(\''+line.strip()+' '+preced_place_holder+'\','+variable_string+'=>{'+'\n'+func1+variable_string+'\n'+'})'+'\n'
    result_file.write(structure)

# Create your views here.
@csrf_exempt
def myFunc(e):
  return e['rows']

# get suggestion for steps
@csrf_exempt
def get_suggestions(request):
    if request.method=='POST':
        cluster = MongoClient("mongodb://localhost:27017")
        db = cluster["test"]
        collection=db["suggestion"]
        data=json.loads(request.body.decode('utf-8'))
        query = data['query']
        suggestions = collection.find({'_id': {'$regex': f'{query}', '$options': 'i'}})
        suggestion_list = [suggestion['_id'] for suggestion in suggestions]
        return HttpResponse(json.dumps({"result":(False,suggestion_list)}))

#store suggestion for steps if not included in mongodb
@csrf_exempt
def store_suggestions(request):
    if request.method=='POST':
        cluster = MongoClient("mongodb://localhost:27017")
        db = cluster["test"]
        collection=db["suggestion"]
        data=json.loads(request.body.decode('utf-8'))
        for dat in data['pre_req']:
            # Check if the string exists in MongoDB
            existing_doc = collection.find_one({'_id': dat['pre']})
            if existing_doc is None:
                # String does not exist, so add it
                collection.insert_one({'_id': dat['pre']})
        
        for dat in data['post_req']:
            # Check if the string exists in MongoDB
            existing_doc = collection.find_one({'_id': dat['post']})
            if existing_doc is None:
                # String does not exist, so add it
                collection.insert_one({'_id': dat['post']})
    return HttpResponse('ok') 

@csrf_exempt
def data_operation(request):
    if request.method=='POST':
        data=json.loads(request.body.decode('utf-8'))
        global dictionary
        all_content['dictionary'] = data['row']
        for item in all_content['dictionary']:
            del item['Level_value']
        id=data['pattern'] 
        cluster = MongoClient("mongodb://localhost:27017")
        db = cluster["test"]
        collection=db["test"]
        result = collection.find_one({"id":id} )
        list_=[]
        if result:
            return HttpResponse(json.dumps({"result":(True,id,result['tab'])}))
        else:
            E_total_factor=0
            list_of_level_pattern=[]
            for i in range(0,len(str(id))):
                if id[i]=='^':
                    list_of_level_pattern.append(int(id[i-1]))
                    E_total_factor+=int(id[i+1])
            list_of_level_pattern.sort()
            
            for doc in collection.find({}):
                F_total_factor=0
                for i in range(0,len(doc['id'])):
                    
                    if doc['id'][i]=='^' and int(doc['id'][i-1])>=list_of_level_pattern[0]:

                        F_total_factor+=int(doc['id'][i+1])
                    else:
                        continue
                if F_total_factor>=E_total_factor:
                    list_.append({'id':doc['id'],'tab':doc['tab'],'E_factor':int(E_total_factor),'F_factor':int(F_total_factor),'rows':len(doc['tab'].split("\n"))})
            
            list_.sort(key=myFunc)
            return HttpResponse(json.dumps({"result":(False,list_)}))


@csrf_exempt
def bdd(request):
    if request.method=='POST':
        global directory
        data=json.loads(request.body.decode('utf-8'))
        
        all_content['directory'] = home_dir+'\Ortho App saves'+'\\'+data['feature']

        
        all_content['fieldnames'] = data['names_factor']
        all_content['table_dictionary'] = data['table_data']
        
        values=[]
        variables=[]
        message = ''
        
        table_data=data['table_data']
        factor_name=data['column_data']
        
        # declare json object and add tag and scenario
        json_object = {}
        json_object["_id"] = data['feature']
        json_object["elements"]=[]
        
        elements_data = {} 
        elements_data["name"] = data['scenerio']
        elements_data["tag"] = "@"+data['tag']
        elements_data["type"] = "scenario_outline"
        elements_data.setdefault("steps", [])

        scenerio="Feature:"+data['feature']+"\n\n@"+data['tag']+"\nScenario Outline:"
        scenerio+=data['scenerio']
        scenerio=scenerio+'\n'

        string1=''
        string_variables=''
        string_values=''
        for dat in data['pre_req']:
            string1+=dat['pre']+' '
            if(dat['pre_variables']!=''):
                string_variables=dat['pre_variables'].split(',')
                string_values=(dat['pre_values']).split(',')
                for i in string_variables:
                    string1+='\"<'+i+'>\",'
                    variables.append(i)
                for j in string_values:
                    values.append(j)
                string1=string1[:-1]
            string1+='\n'
            # add the key and text to jsondata
            key,text=separator(dat['pre'])
            steps_data= {}
            steps_data["keyword"] = key
            steps_data["text"] = text
            elements_data["steps"].append(steps_data)    
        string1+='\n'

        string2="""And Funrnish the information """
        for factor in factor_name:
            string2+="\"<"
            string2+=factor
            string2+=">\","
        string2=string2[:-1]
        # add the key and text to jsondata
        key,text=separator(string2)
        steps_data= {}
        steps_data["keyword"] = key
        steps_data["text"] = text
        elements_data["steps"].append(steps_data)
        string2=string2+'\n\n'

        string3=''
        string_variables=''
        string_values=''
        for dat in data['post_req']:
            string3+=dat['post']+' '
            if(dat['post_variables']!=''):
                string_variables=dat['post_variables'].split(',')
                string_values=(dat['post_values']).split(',')
                for i in string_variables:
                    string3+='\"<'+i+'>\",'
                    variables.append(i)
                for j in string_values:
                    values.append(j)
                string3=string3[:-1]
            string3+='\n'
            # add the key and text to jsondata
            key,text=separator(dat['post'])
            steps_data= {}
            steps_data["keyword"] = key
            steps_data["text"] = text
            elements_data["steps"].append(steps_data)   
        string3+='\n'


        string3=string3+'\n'+'Examples:'+'\n'
        for i in factor_name:
            string3+='|'
            string3+=i
        for i in variables:
            string3+='|'
            string3+=i
        string3+='|'
        string3+='\n'

        
        for line in table_data:
            for i in line:
                if i == 'isEdit':
                    continue
                string3+='|'
                string3+=line[i]
            for j in values:
                string3+='|'
                string3+=j  
            string3+='|'
            string3+='\n'
        
        #append all data to json 
        json_object["elements"].append(elements_data) 
        all_content['result']=scenerio+string1+string2+string3
        
        
        # # Call the API to store data and recieve a response
        # response = requests.post("http://127.0.0.1:8084/",json=json_object)
        # if response.status_code == 200:
        #     # Request was successful
        #     response_data = response.json()
        #     # Process the response data as needed
        #     message = response_data["message"]
        # else:
        #     # Request failed
        #     print("Request failed with status code:", response.status_code)
            
    return HttpResponse(json.dumps({"file_content":all_content['result'],"message":"success"}))

def separator(string):
    if "Given" in string:
        return "Given",string[len("Given"):]
    elif "And" in string:
        return "And",string[len("And"):]
    elif "When" in string:
        return "When",string[len("When"):]
    

@csrf_exempt
def step_def(request):
    file=json.loads(request.body.decode('utf-8'))
    content=file['file_data']
    language=file['lang']
    content=content[:content.find("Examples:")]
    to_iter=content.split("\n")[2:]
    
    if language=='JavaScript':
        folder = os.path.join(all_content['directory'],'BddScenario.js')
        result_file=open(folder,'w')
        for line in to_iter: 
            if "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0 :
                func_generator_js("Given",line[len("Given"):],result_file)

            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_js("And",line[len("And"):],result_file)

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_js("When",line[len("When"):],result_file)

            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func1="userDefinedFunction"
                func_generator_with_variable_js("And",line,result_file,func1)

            elif "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func1='ApplicationLaunch'
                func_generator_with_variable_js("Given",line,result_file,func1)

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func1='ApplicationLogin'
                func_generator_with_variable_js("When",line,result_file,func1)
        
        folder = os.path.join(all_content['directory'],'BddScenario.js')
        result_file=open(folder,'r')
        
    elif language=='Java':
        all_content['scenario_string'] = ''
        all_content['scenario_string'] +='public class seatbooking  {'+'\n'+'\n'+'\t'
        # result_file.write('public class seatbooking  {'+'\n'+'\n'+'\t')
        for line in to_iter: 
            if "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_java("Given",line[len("Given"):])
        
            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_java("And",line[len("And"):])

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_java("When",line[len("When"):])
        
            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_java("And",line)
        
            elif "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_java("Given",line)

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_java("When",line)
        all_content['scenario_string']+='}'

    elif language=='C#':
        folder = os.path.join(all_content['directory'],'BddScenario.cs')
        result_file=open(folder,'w')
        result_file.write('namespace TestingPractice.ProjectName.TA.Steps\n{\n\t[Binding]\n\tpublic sealed class BDDScenarios : TestSteps\n\t{\n\t\t')
        for line in to_iter: 
            if "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
               
                func_generator_cs("Given",line[len("Given"):],result_file)
                
            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_cs("And",line[len("And"):],result_file)

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))==0:
                func_generator_cs("When",line[len("When"):],result_file)

            elif "And" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_cs("And",line,result_file)        

            elif "Given" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_cs("Given",line,result_file)

            elif "When" in line and len(re.findall("<[A-Za-z_0-9]*>", line))!=0:
                func_generator_with_variable_cs("When",line,result_file)
        result_file.write('}\n}')
        folder = os.path.join(all_content['directory'],'BddScenario.cs')
        result_file=open(folder,'r')
         
    return HttpResponse(json.dumps({"file_content":all_content['scenario_string']}))


@csrf_exempt
def automatic(request):
    df = pd.read_csv('file.csv')
    return_list=[]
    fetched=json.loads(request.body.decode('utf-8'))
    for data in fetched['row']:
        temp=[]
        for i in df[data['Factor_name']]:
            temp.append(i)
        return_list.append(temp)
    return HttpResponse(json.dumps({"result":return_list}))

@csrf_exempt
def automatic_pre_post(request):
    df = pd.read_csv('pre_post.csv')
    fetched=json.loads(request.body.decode('utf-8'))
    row1=fetched['row1']
    row2=fetched['row2']
    return_list_pre=[]
    return_list_post=[]
   
    for data in df['pre']:
        
        return_list_pre.append(data)
    
    for data in df['post']:
        return_list_post.append(data)
      
    return HttpResponse(json.dumps({"result_pre":return_list_pre,"result_post":return_list_post,"tag":df['tag'][0],"scenerios":df['scenerio'][0]}))

@csrf_exempt
def enhance(request):
    df = pd.read_csv('LowCodeApp.csv')

    return_list=[]
    for i in df['FunctionName']:
        return_list.append(i)
    return HttpResponse(json.dumps({"result":return_list}))

# Run automation framework
@csrf_exempt
def integrate(request):
    os.chdir("C:/Users/EI12934/Documents/GitHub/TechUtsav")
    cwd = os.getcwd()
    os.system("mvn clean install")
    return HttpResponse("ok")

@csrf_exempt
def enhanced_step_def(request):
    df = pd.read_csv('LowCodeApp.csv')
    data=json.loads(request.body.decode('utf-8'))
    language=data['language']
    flag=data['flag']
    
    if language=='Java':
        all_content['scenario_string'] = ''
        all_content['scenario_string'] +='public class seatbooking  {'+'\n'+'\n'+'\t'
        # result_file.write('public class seatbooking  {'+'\n'+'\n'+'\t')
        for line in data['pre_req']: 
            if "And" in line['pre']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("And",line['pre'][len("And"):],object_with_func,param,str(returnparam),flag)
        
            elif "Given" in line['pre']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("Given",line['pre'][len("Given"):],object_with_func,param,str(returnparam),flag)
        
            elif "When" in line['pre']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("When",line['pre'][len("When"):],object_with_func,param,str(returnparam),flag)
        for line in data['post_req']: 
            if "And" in line['post']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("And",line['post'][len("And"):],object_with_func,param,str(returnparam),flag)
        
            elif "Given" in line['post']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("Given",line['post'][len("Given"):],object_with_func,param,str(returnparam),flag)
            
            elif "When" in line['post']:
                row=df.loc[df['FunctionName'] == line['selectedCar']]
                for index, i in row.iterrows():
                    object_with_func=i['ObjectName']+'.'+i['FunctionName']
                    param=str(i['param1'])
                    returnparam=i['FunctionReturnParam']
                func_generator_java("When",line['post'][len("When"):],object_with_func,param,str(returnparam),flag)
        all_content['scenario_string']+='\n}'

    print(all_content['scenario_string'])
    return HttpResponse(json.dumps({"file_content":all_content['scenario_string']}))


@csrf_exempt
def report(request):
    webbrowser.open_new_tab('C:/Users/EI12934/Documents/GitHub/TechUtsav/target/cucumber-reports/AutomationResults.html')
    return HttpResponse("ok")

@csrf_exempt
def get_inputdata(request):
    data = []
    root = tk.Tk()
    root.wm_attributes('-topmost', True)
    root.withdraw()
    filetypes = (
    ('CSV Files', '*.csv'),)
    file_path = filedialog.askopenfilename(filetypes=filetypes)
    root.destroy()
    if not file_path:
        return HttpResponse(json.dumps({'message':'please select a file'}))
    
    with open(file_path, 'r') as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            data.append(row)
    rows = []
    for row in data:
        factor_name = row['Factor_name']
        level_count = row['Level_count']
        level_values = row['Level_values'].split(',')

        level_value = [{'value': value} for value in level_values]
        
        rows.append({
            'Factor_name': factor_name,
            'Level_count': level_count,
            'Level_value': level_value,
            'Level_values': ''
        })
    return HttpResponse(json.dumps({'rows': rows}))

@csrf_exempt
def save_data(request):
        os.makedirs(all_content['directory'], exist_ok=True)
        folder = os.path.join(all_content['directory'],'inputData.csv')
        fieldnames = list(all_content['dictionary'][0].keys())
        with open(folder, 'w', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_content['dictionary'])
        
        folder = os.path.join(all_content['directory'],'TableData.csv')
        with open(folder, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(all_content['fieldnames'])
        with open(folder, 'a', newline='') as file:
            writer = csv.writer(file)
            for entry in all_content['table_dictionary']:
                row_values = [value for _, value in entry.items()]
                writer.writerow(row_values)

        folder = os.path.join(all_content['directory'],'BDDscenario.feature')
        feature_file=open(folder,'w')
        feature_file.write(all_content['result'])
        
        folder = os.path.join(all_content['directory'],'BddScenario.java')
        result_file=open(folder,'w')
        result_file.write(all_content['scenario_string'])
        
        return HttpResponse('ok')