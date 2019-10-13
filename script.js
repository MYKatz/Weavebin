var textarea = document.querySelector("textarea");

textarea.addEventListener("keydown", autosize);

function autosize() {
  var el = this;
  setTimeout(function() {
    el.style.cssText = "height:auto; padding:0";
    el.style.cssText = "height:" + Math.max(el.scrollHeight + 50, 300) + "px";
  }, 0);
}

autosize.call(textarea);

//modal stuff:

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("loginBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
