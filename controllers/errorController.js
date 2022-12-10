var return404 = async(req, res, next) => {
    try{
        res.status(404).render('pages/error404')
    }
    catch(ex){
        console.log(`homepage error ${ex}`)
    }
    finally{
        
    }
}

module.exports ={ return404 }