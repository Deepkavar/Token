App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("TokenSale.json", function(tokenSale) {
        App.contracts.Deep_TokenSale = TruffleContract(tokenSale);
        App.contracts.Deep_TokenSale.setProvider(App.web3Provider);
        App.contracts.Deep_TokenSale.deployed().then(function(tokenSale) {
          console.log("TokenSale Token Sale Address:", tokenSale.address);
        });
      }).done(function() {
        $.getJSON("DEEP19IT054.json", function(DeepD054) {
          App.contracts.DEEP19IT054 = TruffleContract(DeepD054);
          App.contracts.DEEP19IT054.setProvider(App.web3Provider);
          App.contracts.DEEP19IT054.deployed().then(function(DeepD054) {
            console.log("DeepD054 Token Sale Address:", DeepD054.address);
         
            App.listenForEvents();
            return App.render();
         
          });
    
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.Deep_TokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {

      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
     
    
  
  // Load account data
      if(web3.currentProvider.enable){
        //For metamask
        web3.currentProvider.enable().then(function(acc){
            App.account = acc[0];
          $('#accountAddress').html("Your Account: " +  App.account);
        });
    } else{
        App.account = web3.eth.accounts[0];
        $('#accountAddress').html("Your Account: " +  App.account);
    }

    
  
  
      // Load token sale contract
      App.contracts.Deep_TokenSale.deployed().then(function(instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return tokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        console.log("Token Sold ");
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.DEEP19IT054.deployed().then(function(instance) {
           const DeepD054Instance = instance;
          return DeepD054Instance.balanceOf(App.account);
        }).then(function(balance) {
          $('.d54-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      const numberOfTokens = $('#numberOfTokens').val();
      App.contracts.Deep_TokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });
