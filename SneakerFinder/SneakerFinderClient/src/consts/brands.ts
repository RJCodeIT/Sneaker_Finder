import { brandImages } from '../utils/brandImages';

interface Brand {
    name: string;
    image?: string;
}

export const brands: Brand[] = [
    {
        name: 'Adidas',
        image: brandImages['Adidas']
    },
    {
        name: 'Air Jordan',
        image: brandImages['Air Jordan']
    },
    {
        name: 'Nike',
        image: brandImages['Nike']
    },
    {
        name: 'Yeezy',
        image: brandImages['Yeezy']
    },
    {
        name: 'BAPE',
        image: brandImages['BAPE']
    },
    {
        name: 'Travis Scott',
        image: brandImages['Travis Scott']
    },
    {
        name: 'Corteiz',
        image: brandImages['Corteiz']
    },
    {
        name: 'Carhartt WIP',
        image: brandImages['Carhartt WIP']
    }
];
