const converter = require("json-2-csv");
const fs = require("fs");
const prompts = require("prompts");
const csv = require("csvtojson");
const chalk = require("chalk");

const date = new Date();

const symbolAndMarket = {
	BATS: {
		value: "BATS.LSE",
	},
	ARB: {
		value: "ARB.LSE",
	},
	BTCE: {
		value: "BTCE.XETRA",
	},
	ECAR: {
		value: "ECAR.LSE",
	},
	EQQQ: {
		value: "EQQQ.LSE",
	},
	IITU: {
		value: "IITU.LSE",
	},
	INRG: {
		value: "INRG.LSE",
	},
	PNN: {
		value: "PNN.LSE",
	},
	RB: {
		value: "RB.LSE",
	},
	SEMB: {
		value: "SEMB.LSE",
	},
	SMT: {
		value: "SMT.LSE",
	},
	SSHY: {
		value: "SSHY.LSE",
	},
	STHS: {
		value: "STHS.LSE",
	},
	VFEM: {
		value: "VFEM.LSE",
	},
	VGOV: {
		value: "VGOV.LSE",
	},
	VUSA: {
		value: "VUSA.LSE",
	},
	VUSC: {
		value: "VUSC.XETRA",
	},
};

function outPutCsv(json) {
	const filledOrders = [];
	json.data.filter((res) => {
		if (res.status === "filled") {
			filledOrders.push({
				Symbol: symbolAndMarket[res.symbol]
					? symbolAndMarket[res.symbol].value
					: res.symbol,
				Date: res.date,
				Quantity: Number(
					res.type === "buy" ? res.quantity : `-${res.quantity}`
				),
				Price: Number(res.amount),
			});
		}
	});

	converter.json2csv(filledOrders, (err, csv) => {
		if (err) {
			throw err;
		}

		fs.writeFile(`./results/results-${date}.csv`, csv, { res: true }, (err) => {
			if (err) {
				throw err;
			} else {
				console.log(chalk.green("Created latest CSV"));
			}
		});
	});
}
(async () => {
	try {
		let questions = [];
		let choices = [];

		const files = fs.readdirSync("./raw");
		if (files.length === 0) {
			throw new Error("No files found");
		}
		files.forEach((file) => {
			if (file !== ".DS_Store")
				choices.push({
					title: file,
					description: `File ${file}`,
					value: file,
				});
		});

		if (choices.length > 0)
			questions.push({
				type: "select",
				name: "fileName",
				message: "Pick a color",
				choices,
				initial: 0,
			});

		const response = await prompts(questions);
		if (!response.fileName) {
			throw new Error("Filename not supplied");
		}
		csv()
			.fromFile(`./raw/${response.fileName}`)
			.then((jsonObj) => {
				let data = { data: jsonObj };
				outPutCsv(data);
			});
	} catch (error) {
		console.log(chalk.red(error.message));
	}
})();
