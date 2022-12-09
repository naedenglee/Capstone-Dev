var return404 = async(req, res, next) => {
    res.status(404).render('pages/error404')
}

module.exports =  return404