

import React, { useState } from 'react';
import { Category } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface CategoryScreenProps {
    categories: Category[];
    addCategory: (name: string, color: string) => Promise<void>;
    updateCategory: (id: string, name: string, color: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const Icons = {
    Trash: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Edit: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Save: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Cancel: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
}

const CategoryRow: React.FC<{
    category: Category;
    updateCategory: (id: string, name: string, color: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}> = ({ category, updateCategory, deleteCategory }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [color, setColor] = useState(category.color);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (name.trim() === '') {
            alert("Nama kategori tidak boleh kosong.");
            return;
        }
        setIsSaving(true);
        await updateCategory(category.id, name, color);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(category.name);
        setColor(category.color);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteCategory(category.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg ring-1 ring-white/10">
            <div className="flex items-center gap-3 flex-1">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} disabled={!isEditing} className="w-8 h-8 p-0 border-none rounded-full bg-transparent disabled:cursor-not-allowed" />
                {isEditing ? (
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : (
                    <span className="font-medium text-gray-200">{category.name}</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} disabled={isSaving} className="p-2 text-gray-400 hover:text-green-400 rounded-full hover:bg-green-500/10 transition-colors" aria-label="Simpan">
                            {isSaving ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <Icons.Save className="w-5 h-5" />}
                        </button>
                        <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Batal">
                            <Icons.Cancel className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-blue-500/10 transition-colors" aria-label="Ubah">
                            <Icons.Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Hapus">
                            <Icons.Trash className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi Hapus Kategori"
                message={
                    <p>
                        Anda yakin ingin menghapus kategori <strong className="font-semibold text-white">"{category.name}"</strong>?
                        <br/>
                        <span className="text-sm text-yellow-400 mt-2 block">Kategori yang memiliki transaksi tidak dapat dihapus.</span>
                    </p>
                }
                isConfirming={isDeleting}
            />
        </div>
    );
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ categories, addCategory, updateCategory, deleteCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#84cc16');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newCategoryName.trim();
        if (trimmedName) {
            if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
                alert(`Kategori dengan nama "${trimmedName}" sudah ada.`);
                return;
            }
            setIsAdding(true);
            await addCategory(trimmedName, newCategoryColor);
            setIsAdding(false);
            setNewCategoryName('');
            setNewCategoryColor('#84cc16');
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
             <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8 self-start">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Tambah Kategori Baru</h2>
                <p className="text-gray-400 mb-6">Buat kategori pengeluaran Anda sendiri.</p>
                <form onSubmit={handleAddCategory} className="space-y-4">
                     <div>
                        <label htmlFor="category-name" className="block text-sm font-medium text-gray-400 mb-1.5">Nama Kategori</label>
                        <input
                            type="text"
                            id="category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="cth: Pendidikan"
                            required
                            className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] placeholder:text-gray-500 transition-all"
                        />
                    </div>
                     <div>
                        <label htmlFor="category-color" className="block text-sm font-medium text-gray-400 mb-1.5">Warna</label>
                        <input
                            type="color"
                            id="category-color"
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            className="w-full h-12 p-1 bg-gray-800/60 border border-gray-700 rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? 'Menambahkan...' : 'Tambah Kategori'}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-3 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Daftar Kategori Anda</h2>
                <div className="space-y-3">
                    {categories.length > 0 ? categories.map(category => (
                        <CategoryRow key={category.id} category={category} updateCategory={updateCategory} deleteCategory={deleteCategory} />
                    )) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Belum ada kategori yang ditambahkan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryScreen;
