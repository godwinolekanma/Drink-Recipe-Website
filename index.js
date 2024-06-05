import express from "express"
import axios from "axios"

const app = express()
const port = 3000;
const API_URL = "http://www.thecocktaildb.com"

app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

app.get("/", (req, res) =>{
    res.render("index.ejs")
})

app.get("/search", async(req, res) => {
    res.redirect("/")
})

app.post("/search", async (req, res) => {
    const drink = req.body.drink
    const params = {
        params: {
            s: drink
        }
    }
    try{
        const result = await axios.get(API_URL + "/api/json/v1/1/search.php", params);
        const drinks = result.data["drinks"]
        res.render("select.ejs", {drinks: drinks})
    } catch (error){
        console.error(error)
        res.render("select.ejs", {drinks: null})
    }
})



app.get("/random", async (req,res) => {
    try{
        const result = await axios.get(API_URL + "/api/json/v1/1/random.php")
        const drinkid = result.data["drinks"][0].idDrink
        res.redirect(`/drink?id=${drinkid}`)
    }catch(error){
        console.error(error)
        res.render("select.ejs", {drinks: null})
    }
    

})

app.get("/drink", async(req, res) => {
    const id = req.query.id;
    const params = {
        params: {
            i: id
        }
    }

    function InstructionsMaker(recipe){
        var notNull = true
        var count = 1
        var ingredientHolder = []
        while(notNull){
            if (recipe[`strIngredient${count}`] != null && recipe[`strMeasure${count}`] != null){
                ingredientHolder.push(recipe[`strMeasure${count}`] + recipe[`strIngredient${count}`])
            } else{
                notNull = false
            }
            count++;
        }
        return ingredientHolder
    }

    try{
        const result = await axios.get(API_URL + "/api/json/v1/1/lookup.php", params);
        const recipe = result.data["drinks"][0]
        var Ingredients = InstructionsMaker(recipe)
        const recipeHolder = {
            name: recipe.strDrink,
            alc: recipe.strAlcoholic,
            image: recipe.strDrinkThumb,
            instructionsList: recipe.strInstructions.replaceAll(". ", "|").split("|"),
            howToList: Ingredients
        }
        console.log(recipeHolder.howToList)
        console.log(recipeHolder.instructionsList)
        res.render("recipe.ejs", {recipe: recipeHolder})
    }catch (error){
        console.log(error)
    }
    
})

app.listen(port, () => {
    console.log(`Listening on ${port}`)
})
