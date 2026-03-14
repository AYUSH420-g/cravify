import React from 'react';

const CategoryItem = ({ name, image }) => {
    return (
        <div className="flex flex-col items-center gap-3 cursor-pointer group min-w-[100px] shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-all border-4 border-transparent group-hover:border-primary/10">
                <img src={image} alt={name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-dark font-medium text-lg group-hover:text-primary transition-colors text-center">{name}</span>
        </div>
    );
};

export default CategoryItem;
