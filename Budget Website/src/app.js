// BUDGET CONTROLLER
var budgetController = (function(){
    // Constructors
    var Expense = function(id,description,value){
        this.id = id ;
        this.description = description;
        this.value = value;
        this.Percentage = -1
    };

    Expense.prototype.calPercentage = function (totalIncome){
        if(totalIncome > 0){
        this.Percentage =  Math.round((this.value / totalIncome )*100);
        }
        else{
            this.Percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.Percentage;
    }

    var Income = function(id,description,value){
        this.id = id ;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum=sum+cur.value;
        });

        data.totals[type]= sum;

    }

    // Data structures
    var data = {
        allItems : {
            inc : [],
            exp : []
        },

        totals : {
            exp : 0,
            inc : 0
        },
        budget :0,
        Percentage : -1
    }

    return {
        addItem : function(type,des,val){
            var newItem,id=0;

            //[1,2,3,4] next id =5
            // [1,2,4,6] next id =7
            // last Id +1 =new Id

            // Calculating New Id
            if(data.allItems[type].length > 0){
            id = data.allItems[type][data.allItems[type].length-1].id+1;
            }else {
                id =0;
            }
            
            // Making a new object
            if(type ==='inc'){
                newItem =new Income(id,des,val);
            }
            else if(type==='exp'){
                
                newItem =new Expense(id,des,val);
            }

            // pushing it on the data Structure
            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem : function(type ,id){

           var ids = data.allItems[type].map(function(current){
                return current.id;
            });

          var index = ids.indexOf(id);

          if(index !== -1){
              data.allItems[type].splice(index,1);
          }

        },

        calculateBudget : function(){
            // Calculate total income and Expense
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate Budget Income - Expense
            data.budget = data.totals['inc']-data.totals['exp'];


            // Calculate Percentage
            if(data.totals['inc'] > 0){
            data.Percentage= Math.round((data.totals['exp']/data.totals['inc'])*100);
            }
            else {
                data.Percentage= -1;
            }
        },

        calculatePercentages : function(){

            data.allItems['exp'].forEach(function(cur){
                cur.calPercentage(data.totals['inc']);
            });

        },

        getPercentages : function(){
            var allPercentages = data.allItems['exp'].map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget : function(){
            return{
                budget : data.budget,
                totalIncome :data.totals['inc'],
                totalExpenses : data.totals['exp'],
                Percentage :data.Percentage,
            }
        }
        

    

    }

   

})();


// UI CONTROLLER IIFE

var UIcontroller = (function(){

        var DOMstrings ={
            inputType : '.add__type',
            desctype :  '.add__description',
            valueType : '.add__value'
        }
        return {
            getInput : function (){

                return{
                     type : document.querySelector(DOMstrings.inputType).value, //Either Inc or exp
                     desc : document.querySelector(DOMstrings.desctype).value,
                     value : parseFloat( document.querySelector(DOMstrings.valueType).value)
    
                    };

             },

             addListItem : function(obj,type){
                 var html, newHtml,element;
                if(type==='inc'){
                element=document.querySelector('.income__list');
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                else if(type==='exp'){
                
                element=document.querySelector('.expenses__list');
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // Replace the placeholder

                newHtml =html.replace('%id%',obj.id);
                newHtml =newHtml.replace('%description%',obj.description);
                newHtml =newHtml.replace('%value%',this.formatNumbers(obj.value,type));
                
                // Insert New Html
                element.insertAdjacentHTML('beforeend',newHtml);
                


            },

            deleteListItem : function(selectorId){
                var child =document.getElementById(selectorId)
                child.parentNode.removeChild(child);
            },

            clearFields : function(){
                var fields,fieldsArray;
                fields =document.querySelectorAll('.add__description'+', '+'.add__value');

                fieldsArray =Array.prototype.slice.call(fields);

                fieldsArray.forEach(function(current,index,array) {
                    current.value="";

                });
                fieldsArray[0].focus();
            },

            displayBudget : function(obj) {
                var type;

                obj.budget > 0 ? type='inc' : type = 'exp';
                document.querySelector('.budget__value').textContent = this.formatNumbers(obj.budget,type);
                document.querySelector('.budget__income--value').textContent =this.formatNumbers(obj.totalIncome,'inc');
                document.querySelector('.budget__expenses--value').textContent = this.formatNumbers(obj.totalExpenses,'exp');
                
                if(obj.Percentage > 0){
                    document.querySelector('.budget__expenses--percentage').textContent = obj.Percentage + '%';

                }else{
                    document.querySelector('.budget__expenses--percentage').textContent = '--';
                 
                }
            },

            displayPercentages : function(percentages){
                var fields = document.querySelectorAll('.item__percentage');
               
                var nodeList = function (list,callback){
                    for(var i= 0 ;i< list.length ; i++){
                        callback(list[i],i);
                    }
                };

                nodeList (fields,function(current,index){

                    if(percentages[index] > 0){
                        current.textContent = percentages[index] + '%'; }
                        else {
                            current.textContent = '---';

                        }
                });
            },

            changeType : function(){

                var fields = document.querySelectorAll(
                    '.add__type' +','+ '.add__description' + ',' +'.add__value' 
                );
            },

            displayMoth : function(){

                var monthsList =['January','February','March','April','May','June','July','August','September','October','November','December']
                var now = new Date();
                var year =now.getFullYear();
                var month = now.getMonth();
                document.querySelector('.budget__title--month').textContent =monthsList[month]+' '+year;
            },

            formatNumbers : function(num,type){
                var numSplit,int,dec,sign;
                /* + or - before the number
                    exactly 2 decimal point
                    comma seperator 
                */
               num = Math.abs(num);
               num = num.toFixed(2);

               numSplit = num.split('.');
               int = numSplit[0];
               dec = numSplit[1];

               if(int.length > 3){
                   int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
               }

               type === 'inc' ? sign='+' : sign = '-';

               return sign +' '+int +'.'+ dec;
            },

        }
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetctrl ,uictrl){


    var setupEventListeners =function(){
        document.querySelector('.add__btn').addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event){
    
            if(event.keyCode ===13 || event.which===13){
    
                ctrlAddItem();
            }
        });

        document.querySelector('.add__type').addEventListener('change',uictrl.changeType);
        document.querySelector('.container').addEventListener('click',ctrlDeleteItem);
        
    };

    var updateBudget =function(){

        // Call Calculate Budget
        budgetctrl.calculateBudget();

        //return Budget
        var budget=budgetctrl.getBudget();

        // Display On Ui
        uictrl.displayBudget(budget);


    };

    var updatePercentage = function(){
        //1. Calculate the percentages
        budgetctrl.calculatePercentages();

        //2. Read percentages from Budget controller
        var percentages = budgetctrl.getPercentages();
    
        //3. update the UI
        uictrl.displayPercentages(percentages);

    };

    var ctrlAddItem =function (){

        //1. Geting Input from UI Controller
        var input = uictrl.getInput();

        if(input.desc !== "" && !isNaN(input.value) && input.value >0){
        //2.Add items to budget Controller
        var newItem=budgetctrl.addItem(input.type,input.desc,input.value);

        //3.Add new Items to ui
        uictrl.addListItem(newItem,input.type);
        uictrl.clearFields();

        //4.Calculate and update Budget
        updateBudget();
        updatePercentage();

        }
    };

    var ctrlDeleteItem  = function(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        var type, splitId, id;
        console.log(itemId);
        if(itemId){
            splitId =itemId.split('-');
            type = splitId[0];
            id = parseInt( splitId[1]);


            //1. Delete Item form data Structure
            budgetctrl.deleteItem(type,id);

            //2. Delete the item from UI
            uictrl.deleteListItem(itemId);

            //3. Update the UI according to new Budget
            updateBudget();
            updatePercentage();
        }

    };

    return {
        init :function (){
            console.log('Application Has Started');
            uictrl.displayBudget({
                budget : 0,
                totalIncome :0,
                totalExpenses : 0,
                Percentage :0,
            });
            setupEventListeners();
            uictrl.displayMoth();
        }
    };

    
})(budgetController,UIcontroller);

controller.init();