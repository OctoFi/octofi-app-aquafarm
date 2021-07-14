import RateOption from "../RateOption";

export type RateListProps = {
	items: Array<any>;
	loading?: boolean;
	onSelectRate: (T: any) => void;
	rate?: any;
	pair?: any;
};

const RateList = ({ items, loading, onSelectRate, rate, pair }: RateListProps) => {
	if (loading) {
		return null;
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="d-flex flex-column">
			{items.map((item, index) => (
				<RateOption key={index} item={item} onSelectRate={onSelectRate} rate={rate} pair={pair} index={index} />
			))}
		</div>
	);
};

export default RateList;
