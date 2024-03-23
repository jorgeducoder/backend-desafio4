import { Router } from "express";

import ProductManager from "../manager/productManager.js";

const router = Router();
const PM = new ProductManager('./src/saborescseros.json'); // cambie manager y ruta

router.get('/', async (req, res) => {
    const products = await PM.getProduct();
    res.render('realTimeProducts', {products});
})

export default router;