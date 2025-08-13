import React, { useMemo } from 'react';
import { Transaction, HealthProfile, FoodItem } from '../types';
import { foodDB } from '../data/foodDB';

interface AISuggestionProps {
    transaction: Transaction;
    healthProfile: HealthProfile;
}

const getFoodSuggestion = (transaction: Transaction, healthProfile: HealthProfile): FoodItem | null => {
    // Find alternatives that are cheaper
    let candidates = foodDB.filter(item => item.estimatedPrice < transaction.amount);

    // Filter based on diet preference
    if (healthProfile.dietPreference === 'Vegetarian') {
        candidates = candidates.filter(item => item.isVegetarian);
    }
    if (healthProfile.dietPreference === 'RendahGula') {
        candidates = candidates.filter(item => item.isLowSugar);
    }
    
    // If no candidates, return null
    if (candidates.length === 0) return null;

    // Prioritize by price (cheapest first)
    candidates.sort((a, b) => a.estimatedPrice - b.estimatedPrice);

    return candidates[0];
};


const AISuggestion: React.FC<AISuggestionProps> = ({ transaction, healthProfile }) => {
    const suggestion = useMemo(() => getFoodSuggestion(transaction, healthProfile), [transaction, healthProfile]);

    return (
        <div className="p-4 bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-3">
                <span className="text-xl text-amber-400 mt-0.5">💡</span>
                <div className="flex-grow">
                    <h4 className="font-bold text-amber-300">Saran Cerdas AI</h4>
                    {suggestion ? (
                        <p className="text-sm text-gray-300 mt-1">
                            Untuk pilihan yang lebih hemat dan sehat, lain kali Anda bisa coba <strong className="font-semibold text-amber-200">{suggestion.name}</strong> dengan estimasi harga hanya <strong className="font-semibold text-amber-200">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(suggestion.estimatedPrice)}</strong>.
                        </p>
                    ) : (
                         <p className="text-sm text-gray-400 mt-1">
                            Kami belum menemukan alternatif yang lebih hemat dan sehat untuk transaksi ini.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISuggestion;