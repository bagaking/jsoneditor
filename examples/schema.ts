export const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the item'
        },
        price: {
            type: 'number',
            minimum: 0,
            description: 'The price of the item'
        },
        category: {
            type: 'string',
            enum: ['electronics', 'books', 'clothing'],
            description: 'The category of the item'
        },
        inStock: {
            type: 'boolean',
            description: 'Whether the item is in stock'
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            },
            description: 'Tags for the item'
        },
        details: {
            type: 'object',
            properties: {
                description: {
                    type: 'string'
                },
                manufacturer: {
                    type: 'string'
                },
                model: {
                    type: 'string'
                }
            },
            required: ['description'],
            description: 'Detailed information about the item'
        }
    },
    required: ['name', 'price', 'category']
}; 