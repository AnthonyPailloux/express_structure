// ici mon controller pour mon crud products

let productId = 3;
const products = [
    {id: 1, name: 'Stylo', price: 2},
    {id: 2, name: 'Feutre', price: 3},
    {id: 3, name: 'Fahier', price: 4},
    {id: 4, name: 'Trousse', price: 4.50},
    {id: 5, name: 'Règle', price: 2.50}
];

// logique d'affichage d'un produit



// logique test
exports.listProducts = (req, res) => {
    // console.log('route test de mon controller product');
    // res.send('route test de mon controller product');
    res.status(200).json({
        success: true,
        message: 'liste des produits',
        data: products
    })

}

exports.getProductById = (req, res) => {
    // number converti de string en nombre
    const id = Number(req.params.id)
    // recherche de produit
    const product = products.find(p => p.id === id);

    if(!product){
        // gestion des erreurs
        res.status(404).json({
            success: false,
            message: "produit non trouvé",
            data:null
        })
    }
    // 200 produit trouvé
    res.status(200).json({
        success: true,
        message: 'produit trouvé',
        data: product
    })
};

// ajout d'un produit
    exports.createProduct = (req, res) => {
        const {name, price} = req.body;

        if(!name || !price || typeof price !== 'number'){
            res.status(400).json({
                success: false,
                message: 'name string et price int obligatoire',
                data: null
            })
        };
        // creation d'un objet produit avec id auto-increment
        const newProduct = {id: productId++, name, price};
        // injecte l'objet dans le tableau
        products.push(newProduct);

        console.log(products);

        res.status(201).json({
            success:true,
            message:'produit creer',
            data: newProduct
        })
        // console.log('test de la route de creation de produit');
        
    }