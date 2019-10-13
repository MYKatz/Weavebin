function login(files) {
  var reader = new FileReader();

  reader.onload = function(ev) {
    try {
      console.log(ev);
      wallet = JSON.parse(ev.target.result);
      var public_address;

      arweave.wallets.jwkToAddress(wallet).then((address) => {
        public_address = address;
        console.log(public_address);
      });
    } catch (err) {
      alert("Error logging in.");
    } finally {
    }
  };

  reader.readAsText(files[0]);
}
