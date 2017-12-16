window.addEventListener("load", function(event) {

  // Startupp declared variables nad STARTsetting

  //HTML objects
  let titleAdd = document.getElementById("addTitle");
  let authorAdd = document.getElementById("addAuthor");
  let errorMessage = document.getElementsByClassName('error')[0];
  let viewDiv = document.getElementById('viewDiv');
  let viewBtn = document.getElementById("viewBtn");

  //Saving vaiables
  let fails = 0;
  //let imgList = [];
  let img;
  let savedOutput;
  //  let userOutput;
  let keyAdd;
  let bookId;
  //let bookImg;

  //Default start on buttons etc.
  document.getElementById("viewBtn").disabled = true;

  //JavaScript for google api
  let button = document.getElementById("addGoogleBtn");
  let input = document.getElementById("input");
  let output = document.getElementById("output");
  let bookTest;

  button.addEventListener("click", googleApi);

  // Handel fetch Error function
  function handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  }

  // Google function
  function googleApi(event) {

    // Google Promise
    let url = "https://www.googleapis.com/books/v1/volumes?q=" + input.value;
    let exe = function(success, fail) {
      if (input.value == '') {
        alert('Please input some text before search')
      } else {
        fetch(url).then(handleErrors)
          .then(function(result) {
            success(result);
          }).catch(function(error) {
            console.log(error);
            output.innerHTML = `Failed to fetch, Your internet is mabye momentarly down, Please try again`;
          })
      }
    }
    let googlePromise = new Promise(exe);

    // FETCH GOOGLE BOOK API
    googlePromise.then(function(success) {
      console.log(success);
      return success;
    }, function(fail) {
      fails += 1;
      failMessage = ` <p> Google API-fetch fail Nr: ${fails} - message: Faild to fetch that book colection</p> `
      errorMessage.innerHTML += failMessage;
    }).then(function(json) {

      img = 'no_book_cover.jpg';
      output.innerHTML = '';
      bookTest = '';

      for (var i = 0; i < json.items.length; i++) {
        if (json.items[i].hasOwnProperty('volumeInfo')) {
          if (json.items[i].volumeInfo.hasOwnProperty('imageLinks')) {
            if (json.items[i].volumeInfo.imageLinks.hasOwnProperty('thumbnail')) {
              img = `'${json.items[i].volumeInfo.imageLinks.thumbnail}'`;
            }
          }
        }

        bookTest +=
          `<div class="bookEx">
            <ul>
            <li> <img src=${img} alt="img not found"> </li>
            <li> Title: <span>${json.items[i].volumeInfo.title}</span></li>
            <li> Author: <span>${json.items[i].volumeInfo.authors}</span></li>
            </ul>
            <button class="btn btn-primary addBtn">Select Book</button>
            </div>`;
      }
      output.innerHTML = bookTest;
      let addBtnList = document.getElementsByClassName('addBtn');

      for (var i = 0; i < addBtnList.length; i++) {
        addBtnList[i].addEventListener('click', function(event) {
          if (keyAdd == undefined) {
            alert('You have to request a key before you can add book to your book selection');
          } else {

            let googleTitle = event.target.previousElementSibling.children[1].firstElementChild.innerText;
            let googleAuthor = event.target.previousElementSibling.children[2].firstElementChild.innerText;

            event.target.parentElement.style.border = '2px solid powderblue';
            let urlGoogleAdd = "https://www.forverkliga.se/JavaScript/api/crud.php?op=insert" + "&key=" + keyAdd + "&title=" + googleTitle + "&author=" + googleAuthor;

            getAjax(urlGoogleAdd, addBook);
          }
        });
      }
    }).catch((error) => {
      console.log(error);
      output.innerHTML = 'Sorry! Our book api was not able to fetch your book. Please try another search.';
    });
  }


  // Users Add Book input form
  let userBtn = document.getElementById('userBtn');
  let userAuthor = document.getElementById('userAuthor');
  let userTitle = document.getElementById('userTitle');

  userBtn.addEventListener('click', function(event) {
    if (keyAdd == undefined) {
      alert('You have to request a key before you can add book to your book selection');
    } else {
      let title = userTitle.value;
      let author = userAuthor.value;
      let urlAdd = "https://www.forverkliga.se/JavaScript/api/crud.php?op=insert" + "&key=" + keyAdd + "&title=" + title + "&author=" + author;
      getAjax(urlAdd, addBook);
    }
  });


  // JavaScript for school api

  function getAjax(url, callback, num = 0) {
    let exe = function(success, fail) {
      fetch(url)
        .then((response) => response.json())
        .then((result) => {
          if (result.status !== "success") {
            fail(result);
          } else {
            success(result);
          }
        }).catch((error)=> console.log(error));
    };
    let promise = new Promise(exe);
    promise.then(function(success) {
      console.log(success);
      return success;
    }, function(fail) {
      console.log(fail);
      fails += 1;
      failMessage = ` <p> API-fetch fail Nr: ${fails} - message: ${fail.message}</p> `
      errorMessage.innerHTML += failMessage;
      if (num <= 10) {
        console.log(num);
        getAjax(url, callback, num + 1);
      } else {
        alert(`The fetch failed more than 10 times - Fail message: ${fail.message}`);
      }
    }).then(function(obj) {
      if (obj !== undefined) {
        callback(obj);
      }
    }).catch(function(error) {
      console.log(error);
    });
  }

  // GET KEY eventListener
  document.getElementById('requestKey').addEventListener("click", getKey);

  function getKey() {
    fetch("https://www.forverkliga.se/JavaScript/api/crud.php?requestKey")
      .then((response) => response.json())
      .then((dataKey) => {
        document.getElementById('keyText').innerHTML = dataKey.key;
        //document.getElementById("addBtn").disabled = false;
        keyAdd = dataKey.key;
      }).catch((error) => console.log(error))
  }

  // Display-Hide your Book Selection CSS-dependent
  viewBtn.addEventListener("click", (event) => {
    if (viewDiv.className === 'hidden') {
      viewDiv.setAttribute('class', 'show')
      viewBtn.innerHTML = 'Show Booklist';
    } else {
      viewDiv.setAttribute('class', 'hidden')
      viewBtn.innerHTML = 'Hide Booklist';
    }
  });

  //Add Book START
  function addBook(obj) {
    document.getElementById("viewBtn").disabled = false;
    bookId = obj.id;
    let urlView = "https://www.forverkliga.se/JavaScript/api/crud.php?op=select" + "&key=" + keyAdd;
    getAjax(urlView, addToList);
  }

  //  Book Output
  function addToList(obj) {
    console.log(obj.data.length);
    savedOutput = '';
    for (var i = 0; i < obj.data.length; i++) {

      savedOutput +=
        `
         <div class="bookSaved">
           <ul class='ulList'>
           <li> <img class='bookLogo' src='book-logo.png' alt="img not found"/> </li>
           <li class='spanBooks'>Title: <span class='tittle'>${obj.data[i].title}</span></li>
           <li class='spanBooks'>Author: <span  class='author'>${obj.data[i].author}</span></li>
           <li> updated: <span id='updated'> ${obj.data[i].updated} </span></li>
           <li> Id: <span> ${obj.data[i].id} </span></li>
           </ul>
           <button id='${obj.data[i].id}' class="btn btn-danger deleteBtn">Delete</button>
           </div>

          `;
    }
    viewDiv.innerHTML = savedOutput;


    // Delete Button
    let deleteList = document.getElementsByClassName('deleteBtn');
    let inputChange = document.getElementsByClassName('bookSaved');
    let spanBooks = document.getElementsByClassName('spanBooks');
    let inputList;
    let newInput;
    let newSpan;
    let changeId;

    let inputAuthor;
    let inputTitle;

    console.log('deleteList ' + deleteList.length);
    for (var i = 0; i < deleteList.length; i++) {

      deleteList[i].addEventListener('click', function(event) {
        console.log('removing = ' + event.target.id);
        let deleteGoogleUrl = "https://www.forverkliga.se/JavaScript/api/crud.php?op=delete" + "&key=" + keyAdd + "&id=" + event.target.id;
        getAjax(deleteGoogleUrl, function(obj) {
          let node = event.target.parentElement;
          let parent = event.target.parentElement.parentElement;
          parent.removeChild(node);
          console.log(event.target.id);
        });

      });
    }

    for (var i = 0; i < spanBooks.length; i++) {
      spanBooks[i].addEventListener('click', function(event) {
        let parent;
        //console.log(event.target.parentElement.nextElementSibling.id);
        changeId = event.target.parentElement.nextElementSibling.id;


        newInput = document.createElement('input');
        newInput.className = 'input1';
        newInput.setAttribute('value', '');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('placeholder', 'Titel');

        newInputTwo = document.createElement('input');
        newInputTwo.className = 'input1';
        newInputTwo.setAttribute('value', '');
        newInputTwo.setAttribute('type', 'text');
        newInputTwo.setAttribute('placeholder', 'Author');

        if (event.target.className === 'spanBooks') {
          parent = event.target.parentElement;

          parent.children[1].replaceChild(newInput, parent.children[1].firstElementChild);
          parent.children[2].replaceChild(newInputTwo, parent.children[2].firstElementChild);

          inputList = document.getElementsByClassName('input1');


          for (var i = 0; i < inputList.length; i++) {
            //event.preventDefault();
            inputList[i].addEventListener('blur', function(event) {

              newSpan = document.createElement('span');
              newSpan.className = 'span2';
              newSpan.innerHTML = event.target.value;
              event.target.parentElement.replaceChild(newSpan, event.target);

              let changedItems = document.getElementsByClassName('span2');
              inputTitle = changedItems[0];
              console.log(inputTitle);
              console.log(inputAuthor);
              inputAuthor = changedItems[1];
              console.log(changedItems);
              if (changedItems.length == 2) {

                let changeUrl = "https://www.forverkliga.se/JavaScript/api/crud.php?opop=update" + "&key=" + keyAdd + "&id=" + changeId + '&title=' + inputTitle + '&author=' + inputAuthor;
                getAjax(changeUrl, function(obj) {
                  console.log(obj);
                });
              }
            });
          }

        } else if (event.target.className !== 'spanBooks') {
          event.preventDefault();
          /*parent = event.target.parentElement;
          parent.children[1].replaceChild(newInput,parent.children[1].firstElementChild);
          parent.children[2].replaceChild(newInputTwo,parent.children[2].firstElementChild);*/
        }

      })





    }









  }







});
