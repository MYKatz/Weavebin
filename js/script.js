state = {
  loggedIn: false,
  wallet: null,
  jwk: null
};

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
  if (state.loggedIn) {
    location.reload();
  }
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

//file upload stuff

var filechoose = document.getElementById("keychoose");

filechoose.onchange = function(e) {
  var filelist = filechoose.files;
  if (filelist) {
    login(filelist, function(ev) {
      try {
        wallet = JSON.parse(ev.target.result);

        arweave.wallets.jwkToAddress(wallet).then((address) => {
          loginHandler(wallet, address);
        });
      } catch (err) {
        alert("Error logging in. Please try again.");
        filechoose.value = "";
        success = false;
      } finally {
      }
    });
  }
};

function loginHandler(jwk, address) {
  state.loggedIn = true;
  state.wallet = address;
  state.jwk = jwk;
  document.getElementById("loginBtn").innerText = "Sign Out";
  modal.style.display = "none";
}

async function post() {
  if (state.loggedIn) {
    var paste = document.getElementById("text").value;
    var syntax = document.getElementById("select").value;
    var title = document.getElementById("textInput").value || "Untitled Paste";
    var transaction = await arweave.createTransaction(
      {
        data: paste
      },
      state.jwk
    );
    transaction.addTag("Application-ID", "Weavebin");
    transaction.addTag("Syntax-Highlight", syntax);
    transaction.addTag("Title", title);
    await arweave.transactions.sign(transaction, state.jwk);
    const response = await arweave.transactions.post(transaction);
    displayHeader(transaction.id);
  } else {
    alert("You must be signed in to make a post.");
  }
}

var sub = document.getElementById("submitBtn");

sub.onclick = function() {
  post();
};

function displayHeader(pasteid) {
  var h = document.getElementById("headertext");
  var id = document.getElementById("newpasteid");
  id.innerText = pasteid;
  id.href = "?pasteId=" + pasteid;
  h.classList.remove("displaynone");
  h.classList.remove("hidden");
  h.classList.add("visible");
}

function toggleMain(tags) {
  var p = document.getElementById("pastedisplay");
  var f = document.getElementById("newpaste");

  document.getElementById("postname").innerText = "Paste: " + tags.Title;
  document.getElementById("pastetext").innerText = tags.Text;
  document.getElementById("pastetext").classList.add(tags["Syntax-Highlight"]);

  f.classList.add("displaynone");
  p.classList.remove("displaynone");
  hljs.highlightBlock(document.getElementById("preid"));
}

//get url vars
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

async function getPaste(txid) {
  var transaction;
  try {
    transaction = await arweave.transactions.get(txid);
  } catch {
    alert("Invalid paste. ID is either invalid, or paste has not been uploaded to the blockchain yet. Try again in a few minutes.");
  }
  var text = transaction.get("data", { decode: true, string: true });
  var tags = {};
  tags["Text"] = text;
  transaction.get("tags").forEach((tag) => {
    let key = tag.get("name", { decode: true, string: true });
    let value = tag.get("value", { decode: true, string: true });
    tags[key] = value;
  });
  toggleMain(tags);
}

async function getTransactionsFromAddress(addr) {
  const txids = await arweave.arql({
    op: "and",
    expr1: {
      op: "equals",
      expr1: "from",
      expr2: addr
    },
    expr2: {
      op: "equals",
      expr1: "Application-ID",
      expr2: "Weavebin"
    }
  });

  console.log(txids);
}
