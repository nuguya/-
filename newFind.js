var graphData = require("./station_short2.js");
//var graphData3 = require("./station_short3.js");
const stationData = require("./vertices_short2.js");

/* add 함수 내 변수사용 예시 
graphData[node['Node']] --> Object {구로: 2, 영등포: 2, 도림천: 2, 대림: 3, 문래: 2}
node['Node'] --> 교대 (지하철노선명)
extractline(node['Node']) --> ["I","1"] 이런식으로 뽑힘
temp1,2 --> open이나 close에 있으면 반환.
==================함수목록====================
sorter -> cost 값으로 오름차순 정렬
findID -> stationData 인덱스 찾아 줌
contain -> open과 close에 있는지 찾아줌
extractline -> 노선 정보찾아줌
isContainLine -> 겹치는 노선 찾아줌
_remove -> 리스트 아이템 삭제
*/



var id=0;

var line_list={};
var sorter = function (a, b) {
    return parseFloat(a.cost) - parseFloat(b.cost);
  }

function findID(station_nm)
{
    var i=0
    var res;
    stationData.forEach(x=>{if(x.station_nm==station_nm){
        res=i;    
    }
        ++i;
    });
    return res;
}

// var makenode = function(n_node,cost,huristic,parent,current_line){
//     this.Node=n_node;
//     this.cost=cost;
//     this.huristic=huristic;
//     this.parent=parent;
//     this.current_line=current_line;

//     return this;
// }

function contain(list,station_nm,line_num)
{
    for (var i in list){
        if(list[i]['Node']==station_nm/*list[i].current_line==line_num*/)
            return i;
    }

    return -1;
}

function extractline(station_nm)
{
    var list=[]
    var idx=0;
    for(var i in stationData){
        if(stationData[i]['station_nm']==station_nm){
            list.push(stationData[idx]['line_num']);
        }
        ++idx;
    }
    return list;
}

function isContainLine(comp1,comp2)
{
    var temp=[]
    for(var i in comp1){
        for(var j in comp2){
            if(comp2[j]==comp1[i]){
                temp.push(comp1[i]);
            }
        }
    }
    if(temp.length>0)
        return temp;
    else
        return false;
}


function _remove(list,m)
{
    for(var i in list){
        if(list[i]['Node']==m){
            var a=list.splice(i,1);
            break;
        }
    }
}

function add(node,endpoint,open,close)
{
    for (var key in graphData[node['Node']]){
        
        
        var temp,list,prev_lineNum,current_lineNum;
        var prev_lineNum=extractline(node['Node']);
        var current_lineNum=extractline(key);
        var line_list=isContainLine(prev_lineNum,current_lineNum);
        // if(line_list.length>1){
        //     console.log(key,node.Node);
        //     console.log(line_list);
        // }
        //line_number=isContainLine(line_number,node['Node'].current_line);
        for(var i in line_list){
            var line_number=line_list[i];
            //console.log(key,node['Node'],line_number);
            //console.log(key,line_number);
            var new_g = node['cost']+graphData[node['Node']][key];
            var temp1=contain(open,key,line_number);
            var temp2=contain(close,key,line_number);
            if(temp1!=-1 || temp2!=-1){
                if(temp1!=-1){
                    temp=temp1;
                    list=open[temp];
                }
                if(temp2!=-1){
                    temp=temp2;
                    list=close[temp];
                }
                if(list['cost']<=new_g)
                    continue;
            }
            if(contain(open,key,line_number)!=-1){
                _remove(open,key);
            }
            if(contain(close,key,line_number)!=-1){
                _remove(close,key);
            }
            //console.log(id++);
            var huristic= function(){
                //console.log(node['Node'],node['F']); 디버깅용
                if(line_number!=node['current_line']){
                    //console.log(key,line_number);
                    new_g+=10;
                }
                // else if(isContainLine(endpoint,extractline(key))){
                //     new_g-=1;
                //     //console.log(key);
                // }
                // else
                //     new_g+=2;
                //Math.abs(stationData[findID(endpoint)]['ypoint_wgs']-stationData[findID(key)]['ypoint_wgs'])+Math.abs(stationData[findID(endpoint)]['xpoint_wgs']-stationData[findID(key)]['xpoint_wgs']);
            }();
            var parent=node;
        
            var a={'Node':key,'cost':new_g,'parent':parent,'current_line':line_number};
            var open;
            //console.log(key,line_number);
            open.push(a);
            open.sort(sorter)
        }
    }
}

function makepath(close_list)
{
    var path=[];
    var transit=[];
    close_list[0]['current_line']=close_list[1]['current_line'];
    var temp = close_list[close_list.length-1];
    while(temp!=-1){
        path.push(temp.Node); //결과값에 이름만 저장
        //path.push(temp);//결과값에 객체 저장
        if(temp.current_line!==temp.parent.current_line){
            if(temp.parent.Node!=undefined)
                transit.push(temp.parent.Node);
        }
        temp=temp.parent;
    }

    return {PATH:path,TRANSIT:transit};
}

function shortestTransfer(start, end){
    var open=[];
    var close=[];

    var start_line_num=extractline(start);
    var end_line_num=extractline(end);

    open.push({'Node':start,'cost':0,'parent':-1,'current_line':start_line_num}); //첫 노드를 open에 집어 넣음.
    var path,transit;
    while(open.length>0){
        var next_node=open[0];
        //console.log(open[0],open[0].parent.Node);
        //console.log(open[0]['Node'],open[0]['current_line'],open[0]['cost']); 디버깅
        close.push(next_node);
        //console.log(close[close.length-1]['Node'],close[close.length-1]['F'],close[close.length-1]['cost']);
        var a = open.splice(0,1);
        if(next_node['Node']==end){
            var result=makepath(close);
            break;
        }
        add(next_node,end_line_num,open,close);
    } 

    // for (var i in close){
    //     delete close[i];
    //     console.log(close[i]);
    //   }

//    console.log(result.PATH.reverse());

    //console.log(result.PATH);
    result.TRANSIT.reverse();
    for(var i in result.TRANSIT)
     console.log("Transit "+result.TRANSIT[i]);

    /* 결과 값
    result.TRANSIT --> 
    */
   /*
   var numPath = [];
    for (let i = 0; i < res.length-1; i++) {
      for (let j in graphData3) {
        if (res[i] === j)
          numPath[i] = graphData3[j].num;
      }
    }
    */
   for(var i in result.PATH)
   console.log(result.PATH[i]);
    return result.PATH.reverse();
 
}

console.log(shortestTransfer('인천대입구', '동대입구'));


/*
var cnt = 0;
function infinity(i) {
  if (i == stationData.length) return;
  var resPath = {};
  var start = stationData[i].station_nm;
  var numStart = graphData3[start].num;
  resPath[`${numStart}`] = {};
  for (let j = 0; j < stationData.length; j++) {
    var end = stationData[j].station_nm;
    if (start === end) continue;
    var numEnd = graphData3[end].num;
    var path = shortestTransfer(start, end);
    resPath[`${numStart}`][`${numEnd}`] = path;
  }
  fs.writeFile(`./pathData/${numStart}.js`, 'module.exports = ' + JSON.stringify(resPath), function (err) {
    if (err === null) {
      console.log(`${numStart} good`);
    } else {
      console.log(`${numStart} bad..`);
    }
    infinity(++cnt);
  });
}

var fs = require('fs');
infinity(cnt);
//shortestTransfer('선학', '춘천');
/*var res = shortestTransfer('선학', '아산');
    var path = res.path;
    var tran = res.tran;
    console.log(path, tran);*/
/*
var asdf = {"1": 1, "2":2,"3":3};
fs.writeFile(`./pathData/test.js`, 'module.exports = ' + JSON.stringify(asdf), function (err) {
  if (err === null) {
    console.log('good');
  } else {
    console.log('bad');
  }
});*/