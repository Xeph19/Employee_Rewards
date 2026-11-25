import Button from '../common/Button';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';

const categoryDescriptions = {
    Dining: 'Meals, cafés, and food experiences.',
    Groceries: 'Everyday food and household essentials.',
    Wellness: 'Health, fitness, and personal wellbeing.',
    Lifestyle: 'Shopping, hobbies, and everyday experiences.',
    Entertainment: 'Activities, attractions, and leisure.',
};

export default function RewardCard({ reward, balance, onRedeem }) {
    const affordable = balance >= reward.points_cost;

    return (
        <article className="flex min-h-64 flex-col justify-between gap-5 rounded-2xl border border-cod-gray/20 bg-cararra p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cod-gray/40 hover:shadow-md">
            <div className="grid gap-3">
                <div className="flex items-start justify-between gap-3">
                    <Tooltip text={categoryDescriptions[reward.merchant.category] ?? 'Reward category'}>
                        <span tabIndex="0" className="rounded-full border border-cod-gray/25 px-2.5 py-1 text-xs font-bold">
                            {reward.merchant.category}
                        </span>
                    </Tooltip>
                    <span className="text-xs font-semibold text-cod-gray/65">
                        {reward.stock_quantity ?? 'Unlimited'} left
                    </span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-cod-gray/65">{reward.merchant.name}</p>
                    <h2 className="text-lg font-normal text-cod-gray/85 tracking-tight">{reward.name}</h2>
                </div>
                <p className="text-sm leading-6 text-cod-gray/75">{reward.description}</p>
            </div>
            <div className="flex items-end justify-between gap-3 border-t border-cod-gray/10 pt-3">
                <div className="grid">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cod-gray/60">Prize Cost</span>
                    <strong className="text-2xl font-black text-cod-gray">
                        {reward.points_cost.toLocaleString()} <span className="text-sm font-extrabold text-pomegranate">pts</span>
                    </strong>
                </div>
                <Button disabled={!affordable} onClick={() => onRedeem(reward)}>
                    <Icon name="gift" />
                    {affordable ? 'Redeem' : 'Need more points'}
                </Button>
            </div>
        </article>
    );
}
