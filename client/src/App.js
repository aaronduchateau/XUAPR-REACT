import React, { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import PreciousChickenToken from "./contracts/PreciousChickenToken.json";
import { Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Needs to change to reflect current PreciousChickenToken address
const contractAddress = '0xa8dC92bEeF9E5D20B21A5CC01bf8b6a5E0a51888';

let provider;
let erc20;
let noProviderAbort = true;

window.ethereum.on('accountsChanged', (_chainId) => window.location.reload());
window.ethereum.on('disconnect', (_chainId) => window.location.reload());

// Ensures metamask or similar installed
if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
	try {
		// Ethers.js set up, gets data from MetaMask and blockchain
		//window.ethereum.enable().then(
		//	provider = new ethers.providers.Web3Provider(window.ethereum)
		//);
		//signer = provider.getSigner();
		//erc20 = new ethers.Contract(contractAddress, PreciousChickenToken.abi, signer);
		//provider = new ethers.providers.Web3Provider(window.ethereum);
		//if(provider){
		//	setSigner(provider.getSigner());
		//		erc20 = new ethers.Contract(contractAddress, PreciousChickenToken.abi, signer);
		//}
				
		noProviderAbort = false;
	} catch (e) {
		noProviderAbort = true;
	}
}

function App() {
	const [signer, setSigner] = useState(null);
	const [walAddress, setWalAddress] = useState('0x00');
	const [pctBal, setPctBal] = useState(0);
	const [ethBal, setEthBal] = useState(0);
	const [coinSymbol, setCoinSymbol] = useState("Nil");
	const [transAmount, setTransAmount] = useState('0');
	const [pendingFrom, setPendingFrom] = useState('0x00');
	const [pendingTo, setPendingTo] = useState('0x00');
	const [pendingAmount, setPendingAmount] = useState('0');
	const [isPending, setIsPending] = useState(false);
	const [errMsg, setErrMsg] = useState("Transaction failed!");
	const [isError, setIsError] = useState(false);

	// Aborts app if metamask etc not present
	if (noProviderAbort) {
		return (
			<div>
				<h1>Error</h1>
				<p><a href="https://metamask.io">Metamask</a> or equivalent required to access this page.</p>
			</div>
		);
	}

	try {
		// Ethers.js set up, gets data from MetaMask and blockchain
		//window.ethereum.enable().then(
		//	provider = new ethers.providers.Web3Provider(window.ethereum)
		//);
		//signer = provider.getSigner();
		//erc20 = new ethers.Contract(contractAddress, PreciousChickenToken.abi, signer);
		provider = new ethers.providers.Web3Provider(window.ethereum);
		if (provider && !signer){
			setSigner(provider.getSigner());
			erc20 = new ethers.Contract(contractAddress, PreciousChickenToken.abi, signer);
		}
				
		//noProviderAbort = false;
	} catch (e) {
		console.log('something fucked up happened');
	}

	// Notification to user that transaction sent to blockchain
	const PendingAlert = () => {
		if (!isPending) return null;
		return (
			<Alert key="pending" variant="info"
				style={{ position: 'absolute', top: 0 }}>
				Blockchain event notification: transaction of {pendingAmount}
			&#x39e; from <br />
				{pendingFrom} <br /> to <br /> {pendingTo}.
			</Alert>
		);
	};

	// Notification to user of blockchain error
	const ErrorAlert = () => {
		if (!isError) return null;
		return (
			<Alert key="error" variant="danger"
				style={{ position: 'absolute', top: 0 }}>
				{errMsg}
			</Alert>
		);
	};

	if (signer) {	
		// Sets current balance of PCT for user
		signer.getAddress().then(response => {
			setWalAddress(response);
			return erc20.balanceOf(response);
		}).then(balance => {
			setPctBal(balance.toString())
		});

		// Sets current balance of Eth for user
		signer.getAddress().then(response => {
			return provider.getBalance(response);
		}).then(balance => {
			let formattedBalance = ethers.utils.formatUnits(balance, 18);
			setEthBal(formattedBalance.toString())
		});

		// Sets symbol of ERC20 token (i.e. PCT)
		//async function getSymbol() {
		//	let symbol = await erc20.symbol();
		//	return symbol;
		//}
		//let symbol = getSymbol();
		//symbol.then(x => setCoinSymbol(x.toString()));
	}

	// Interacts with smart contract to buy PCT
	async function buyPCT() {
		// Converts integer as Eth to Wei,
		let amount = await ethers.utils.parseEther(transAmount.toString());
		try {
			await erc20.buyToken(transAmount, { value: amount });
			// Listens for event on blockchain
			await erc20.on("PCTBuyEvent", (from, to, amount) => {
				setPendingFrom(from.toString());
				setPendingTo(to.toString());
				setPendingAmount(amount.toString());
				setIsPending(true);
			})
		} catch (err) {
			if (typeof err.data !== 'undefined') {
				setErrMsg("Error: " + err.data.message);
			}
			setIsError(true);
		}
	}

	// Interacts with smart contract to sell PCT
	async function sellPCT() {
		try {
			await erc20.sellToken(transAmount);
			// Listens for event on blockchain
			await erc20.on("PCTSellEvent", (from, to, amount) => {
				setPendingFrom(from.toString());
				setPendingTo(to.toString());
				setPendingAmount(amount.toString());
				setIsPending(true);
			})
		} catch (err) {
			if (typeof err.data !== 'undefined') {
				setErrMsg("Error: " + err.data.message);
			}
			setIsError(true);
		}
	}

	// Sets state for value to be transacted
	// Clears extant alerts
	function valueChange(value) {
		setTransAmount(value);
		setIsPending(false);
		setIsError(false);
	}

	// Handles user buy form submit
	const handleBuySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		valueChange(e.target.buypct.value);
		buyPCT();
	};

	// Handles user sell form submit
	const handleSellSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		valueChange(e.target.sellpct.value);
		sellPCT();
	};

	// Handles user sell form submit
	const handleConnectSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Ethers.js set up, gets data from MetaMask and blockchain
			window.ethereum.enable().then(()=>{
				provider = new ethers.providers.Web3Provider(window.ethereum);
				setSigner(provider.getSigner());
				erc20 = new ethers.Contract(contractAddress, PreciousChickenToken.abi, signer);
			}
			);
			
			//noProviderAbort = false;
		} catch (e) {
			console.log(e);
			//noProviderAbort = true;
		}
	};

	return (
		<div className="App">
			<header className="App-header">
			<div className="ant-page-header-heading-title">
					GLD3
				</div>
				<form onSubmit={handleConnectSubmit}>
					<span className="connect-button-holder">
						<Button type="submit" className="connect-button">Connect MetaMask</Button>
					</span>
					
				</form>
				<ErrorAlert />
				<PendingAlert />
				<div className="picture-text">
				<img src="goldsaved.png" className="gold-image"/>
				<div className="gold-text-right"> 
				<div className="gold-text-right-title">
				Immutable Gold that you can collateralize. 
				</div>
				<br/>
				Tokenized at Market Price. Embeded in the blockchain. Web3 ready. </div>
				</div>
				<h2>{coinSymbol}</h2>

				<p>
					User Wallet address: {walAddress}<br />
		Eth held: {ethBal}<br />
		PCT held: {pctBal}<br />
				</p>

				<form onSubmit={handleBuySubmit}>
					<p>
						<label htmlFor="buypct">PCT to buy:</label>
						<input type="number" step="1" min="0" id="buypct"
							name="buypct" onChange={e => valueChange(e.target.value)} required
							style={{ margin: '12px' }} />
						<Button type="submit" >Buy PCT</Button>
					</p>
				</form>

				<form onSubmit={handleSellSubmit}>
					<p>
						<label htmlFor="sellpct">PCT to sell:</label>
						<input type="number" step="1" min="0" id="sellpct"
							name="sellpct" onChange={e => valueChange(e.target.value)} required
							style={{ margin: '12px' }} />
						<Button type="submit" >Sell PCT</Button>
					</p>
				</form>

				<a title="GitR0n1n / CC BY-SA (https://creativecommons.org/licenses/by-sa/4.0)" href="https://commons.wikimedia.org/wiki/File:Ethereum-icon-purple.svg">
					<span style={{ fontSize: '12px', color: 'grey' }}>
						Ethereum logo by GitRon1n
		</span></a>
			</header>
		</div>
	);
}

export default App;

