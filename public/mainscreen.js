'use strict';

//////////////////////////////////////////////////////////////
///////////////          Helper Functions       /////////////
////////////////////////////////////////////////////////////
/* add data to the database chatroom */
function addToData(element){
  const obj = {
    title:element.find('#title').val(),
    category:element.find('#category').val()
  };
  return fetch('https://jabber-jam.herokuapp.com/chatrooms',{
    method: 'POST',
    mode:'cors',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(obj)
  })
  .then(res=>{
    if (!res.ok) {
      return Promise.reject(res.statusText);
    }
    return res.json();
  });
}

//////////////////////////////////////////////////////////////
///////////////        State Modification       /////////////
////////////////////////////////////////////////////////////
/*getting chatroom documents from database*/
function getDataChatroom(state){
  return fetch('https://jabber-jam.herokuapp.com/chatrooms',{
    method: 'GET',
    mode:'cors',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
  .then(res=>{
    if (!res.ok) {
      return Promise.reject(res.statusText);
    }
    return res.json();
  });
}

/*filter chatrooms*/
function filterChatroom(state,category, arr){
  state.chatroomList = arr;
  state.filterChatroomList = state.chatroomList.filter(el=>{
    return el.category === category;
  });
  return state.filterChatroomList;
}

/*getting distinct category from the database*/
function getDataCategory(state){
  return fetch('https://jabber-jam.herokuapp.com/chatrooms/distinct',{
    method: 'GET',
    mode:'cors',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
  .then(res=>{
    if (!res.ok) {
      return Promise.reject(res.statusText);
    }
    return res.json();
  });
}

/* Main screen set bool value for show/hide */
function showAndHideMain(state){
  return (state.isMainScreen)?state.isMainScreen = false:state.isMainScreen = true;
}
//////////////////////////////////////////////////////////////
///////////////          Render                 /////////////
////////////////////////////////////////////////////////////
/*render the page*/
function render(state,chatroomElement,categoryElement){
  Promise.all([renderCategoryList(state,categoryElement),
    renderChatroomList(state, chatroomElement)]);
}

/* show all chatrooms or filtered chatroom list */
function renderChatroomList(state,chatroomElement,categoryElement){
  getDataChatroom(state)
  .then(resQ=>{
    let chatroomArr;
    if(!categoryElement){
      state.chatroomList = resQ;
      chatroomArr = state.chatroomList;
    }else{
      chatroomArr = filterChatroom(state, categoryElement.text(),resQ);
    }
    let htmlStr = `<p>Chatroom List</p>
          <ul>`;
    const mappedChat = chatroomArr.map(el=>{
      return `<li data-id=${el.id}>${el.title}</li>`;
    }).join('\n\t');

    htmlStr += mappedChat + '</ul>';
    chatroomElement.html(htmlStr);
  });
}

/* show all the category */
function renderCategoryList(state,element){
  getDataCategory(state)
  .then(resQ =>{
    state.categoryList = resQ;
    let htmlStr = `<p>Categories</p>
          <ul>`;
    const mappedCategory = state.categoryList.map(el=>{
      return `<li>${el}</li>`;
    }).join('\n\t');
    htmlStr += mappedCategory + `</ul>`;
    element.html(htmlStr);
  });
}

//////////////////////////////////////////////////////////////
///////////////          Event Listeners        /////////////
////////////////////////////////////////////////////////////
/* creates a chat room in the database */
function createChatroom(state){
  $('.chatroom_form').on('submit',function(event){
    event.preventDefault();
    addToData($('.chatroom_form'))
    .then((resQ)=>{
      alert(`You have created the chatroom with the title ${resQ.title} and category ${resQ.category}`);
      render(state,$('.list_chatroom'),$('.category_list'));
    });
  });
}

/* Show filter chatrooms */
function showFilterChatroom(state){
  $('.category_list').on('click','li',function(event){
    renderChatroomList(state,$('.list_chatroom'),$(this));
  });
}

/*show all chatrooms */
function showAllChatrooms(state){
  $('.category_list').on('click','p',function(event){
    renderChatroomList(state,$('.list_chatroom'));
  });
}

/*hide mainscreen */
function hideMainScreen(state){
  $('.list_chatroom').on('click','li',function(event){
    showAndHideMain(state);
    $('.main_hide_show').hide();
    $('.single_chatroom').show();
  });
}

//////////////////////////////////////////////////////////////
///////////////          Callback Function      /////////////
////////////////////////////////////////////////////////////
$(function(){
  render(appState,$('.list_chatroom'),$('.category_list'));
  createChatroom(appState);
  showFilterChatroom(appState);
  showAllChatrooms(appState);
  hideMainScreen(appState);
});