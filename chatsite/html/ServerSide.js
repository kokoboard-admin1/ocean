//HTTP GETをハンドリングする
function doPost(e) {
  var text = JSON.parse(e.postData.getDataAsString())
  var method = text["method"]
  var userid = text["Userid"]
  if(method == "room_get"){
    var result = {
      Rooms: RoomGet(userid),
      Rooms_last_message: Getlastmessage(RoomGet(userid)),
      On_Offline: OnlineGet()
    }
  }else if(method == "log_post"){
  var result = {
      message: postlog(text)
    }
  }else if(method == "login"){
    var result = {
      login_info: Login(text),
      icons_info: IconGet()
    }
  }else if(method == "create"){
    var result = {
      login_info: UserCreate(text),
      icons_info: IconGet()
    }
  }else if(method == "icon_up"){
    var result = {
      icon_url: Up_icon(text)
    }
  }else if(method == "log_get"){
    var result = {
      logs: Log_get(text),
      Rooms_last_message: Getlastmessage(RoomGet(userid)),
      On_Offline: OnlineGet()
    }
  }else if(method == "offline"){
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート6").getRange(1,1).setValue(text)
    OnlineOffline(text)
    var result = {
      "result": "ok"
    }
  }else if(method == "online"){
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート6").getRange(1,1).setValue(text)
    OnlineOffline(text)
    var result = {
      "result": "ok"
    }
  }else{
    var result = {
      logs: "You are an idiot"
    }
  }
    var out = ContentService.createTextOutput();

    //Mime TypeをJSONに設定
    out.setMimeType(ContentService.MimeType.JSON);

    //JSONテキストをセットする
    out.setContent(JSON.stringify(result));

    return out;
}

//メッセージを保存する
function postlog(text){
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート6").getRange(1,1).setValue(text)
    var message_log = text["message"]
    var user_id = text["Userid"]
    console.log(user_id)
    var user_log = UserGet(user_id)
    var ip = text["ip"]
    console.log(user_log)
    var room = text["room"]
    var time = new Date()
    var data_array = [[time,user_log,message_log,ip]]
    var respons = {
      "time": time,
      "user": user_log,
      "message":message_log
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(room)
    var lastRow = ss.getLastRow() + 1
    ss.getRange(lastRow,1,1,4).setValues(data_array)
    var result = {
        message: respons
    }
    return result
}

//HTTP GETをハンドリングする
function Log_get(e) {
  var param = e["log-get"]
  //パラメーター[false]で最新10件のログを取得
  if(param == "false"){
    var room = e["room"]
  try{
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(room)
  var lastRow = ss.getLastRow()
  var lastRow_hoge = lastRow - 9
  if(lastRow_hoge <= 1){
    lastRow_hoge = 2
    var values = ss.getRange(lastRow_hoge,1,lastRow - 1,3).getValues()
  }else{
  var values = ss.getRange(lastRow_hoge,1,lastRow_hoge + (10 - lastRow_hoge),3).getValues()
  }
    var result = {
        logs: values
    }

    return result
  }catch{
  var result = {
    logs: false
  }
  return result
  }
  //パラメーターがtrueで過去のログを最大10件取得
  }else{
    var load_num = e["load"]
    var room = e["room"]
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(room)
    var loadlastRow = ss.getLastRow() - load_num * 10
    console.log(loadlastRow)
    if (loadlastRow - 1 < 1) {
      var result = {
        logs: false
      }
    }else{
      var i = 0;
      var llr = loadlastRow
      console.log(i < 11 && loadlastRow > 0)
      for(var i = 0; i < 11 && llr - 2 > 0; i ++){
        llr --
      }
      console.log(llr)
      if(llr - 2 <= 0){
      console.log(loadlastRow - i)
      var values = ss.getRange(loadlastRow - i, 1,loadlastRow - 1,3).getValues()
      console.log(values)
      }else{
        var values = ss.getRange(loadlastRow - 9, 1,10,3).getValues()
        console.log(values)
      }
      var result = {
        logs: values
      }
    }
    return result

  }
}

function idCreate(){
  var id = ""
  var length = parseInt(Math.random() * 5) + 15 //1~9の数字をランダムに選ぶ
  for (var i = 0; i < length; i++){
  var randonum = parseInt(Math.random() * 9) + 1 //1~9の数字をランダムに選ぶ
  randonum = randonum.toString()
  id = id + randonum
  }
  id = id.toString()
  console.log(id)
  return id
}

function UserCreate(text) {
  var setusername = text["Username"]
  var setuserpass = text["Userpass"]
  var setuserid = idCreate()
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users")
  var userinfos = [[setusername,setuserpass,setuserid]]
  ss.getRange(ss.getLastRow() + 1,1,1,3).setValues(userinfos)
    var userinfo = {
      "Username": setusername,
      "Userid": setuserid
    }
    return userinfo

}

//useridからuser名を取得
function UserGet(userid) {
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1N2QIzWtBtlO-hbwnuRdpkkL_KvtqB3wwRf2VeLvRiEE/edit")
  var user_sh = ss.getSheetByName("Users")
  var users = user_sh.getRange(2,3,user_sh.getLastRow() - 1).getValues()
  var users = users.flat()
  var userrow = users.indexOf(userid)
  var username = user_sh.getRange(userrow + 2,1).getValue()
  return username
}

function RoomGet(userid){
  userid = userid.toString()
  var user_rooms = []
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1N2QIzWtBtlO-hbwnuRdpkkL_KvtqB3wwRf2VeLvRiEE/edit").getSheetByName("Rooms")
  var rooms = ss.getRange(2,1,ss.getLastRow() - 1,2).getValues()
  for (var value of rooms){
    var users = value[1].split(" ")
    var decide = users.indexOf(userid)
    if (decide != -1) {
      user_rooms.push(value[0])
    }
  }
  console.log(user_rooms)
  return user_rooms
}

function Login(text) {
  var username = text["Username"]
  var userpass = text["Userpass"]
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1N2QIzWtBtlO-hbwnuRdpkkL_KvtqB3wwRf2VeLvRiEE/edit").getSheetByName("Users")
  var usernames = ss.getRange(2,1,ss.getLastRow() - 1,1).getValues()
  usernames = usernames.flat()
  var user_row = usernames.indexOf(username)
  if (user_row == -1){
    return "false"
  }else{
  var pass = ss.getRange(user_row + 2,2).getValue()
  var pass = pass.toString()
  var decide = pass === userpass
  if (decide){
    var userid_icon = ss.getRange(user_row + 2,3,1,2).getValues()
    if(!userid_icon[0][1]) {
      var icon = "../images/icon1.jpg"
    }else {
      var icon = `https://lh3.googleusercontent.com/d/${userid_icon[0][1]}`
    }
    var userinfo = {
      "Username": username,
      "Userid": userid_icon[0][0],
      "Usericon": icon
    }
    console.log(userinfo)
    return userinfo
  }else{
    return "false"
  }
  }

}

function Up_icon(text) {
  try{
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users")
    var userrow = sh.getRange(2,3,sh.getLastRow(),1).getValues().flat().indexOf(text["Userid"]) + 2
    var geticonid = sh.getRange(userrow,4).getValue()
    if(geticonid != "") {
      delFileByID(geticonid)
    }
    const folderName = 'icons'; // 取得したいフォルダの名前
    const folder = 
    DriveApp.getFolderById("1lTkDieYr33KavkBZeq167qahasjmB1J6")
    var data = Utilities.base64Decode(text["files"]["file"], Utilities.Charset.UTF_8);
    var blob = Utilities.newBlob(data, MimeType.PNG, text["files"]["filename"]);
    var id = folder.createFile(blob).getId()
    var iconset = sh.getRange(userrow,4).setValue(id)
    return `https://lh3.googleusercontent.com/d/${id}`
  }catch(e){
    sh.getRange(100,1).setValue(e)
    sh.getRange(100,3).setValue(text["filename"])
    sh.getRange(101,1).setValue(text)
    console.log(e)
  }
  }

function delFileByID(id) {
//DriveAppクラスからファイルIDでファイル一意に取得する
var fileData = DriveApp.getFileById(id);
//IDから取得したファイルをゴミ箱のフラグをtrueにする
var getData = fileData.setTrashed(true);
}

function Getlastmessage(user_rooms) {
  var rooms_last_message = []
  for (var room of user_rooms){
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(room)
    var last_message = sh.getRange(sh.getLastRow(),1,1,3).getValues()
    last_message = last_message.flat()
    rooms_last_message.push(last_message)
  }
  console.log(rooms_last_message)
  return rooms_last_message
  }
function OnlineOffline(text) {
  var userid = text["Userid"]
  if (userid){
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1N2QIzWtBtlO-hbwnuRdpkkL_KvtqB3wwRf2VeLvRiEE/edit")
  var user_sh = ss.getSheetByName("Users")
  var users = user_sh.getRange(2,3,user_sh.getLastRow() - 1).getValues()
  var users = users.flat()
  var userrow = users.indexOf(userid)
  if (text["method"] == "offline"){
    var value = false
  }else if (text["method"] == "online"){
    var value = true
  }
  var username = user_sh.getRange(userrow + 2,5).setValue(value)
  }
}

function OnlineGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users")
  var usersinfo = ss.getRange(2,1,ss.getLastRow() - 1,5).getValues()
  console.log(usersinfo)
  var users = []
  var offusers = []
  for (var values of usersinfo){
    values.splice(1,3)
  if(values[1] == true){
    users.push(values)
  }else{
    offusers.push(values)
  }
  }
  for (var value of offusers) {
    users.push(value)
  }
  console.log(users)
  return users
}
function IconGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users")
  var users = ss.getRange(2,1,ss.getLastRow() - 1,1).getValues()
  var usericons = ss.getRange(2,4,ss.getLastRow() - 1,1).getValues()
  users = users.flat()
  usericons = usericons.flat()
  console.log(users)
  console.log(usericons)
  var icons_info = {}
  var i = 0;
  for (var username of users) {
    if(usericons[i]){
      var icon = `https://lh3.googleusercontent.com/d/${usericons[i]}`
    }else {
      var icon = "../images/icon2.jpg"
    }
    icons_info[username] = icon
    i++
  }
  return icons_info
}
