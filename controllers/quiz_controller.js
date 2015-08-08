var models = require('../models/models.js');
var Sequelize = require('sequelize');

// GET /quizes/:id
exports.load = function (req, res, next, quizId){
	console.log('Valor de quizId es:' + quizId);
	models.Quiz.find({
			where: {id: Number(quizId)},
			include: [{ model: models.Comment }]
		}).then(
		function(quiz){
			if (quiz) {
				req.quiz = quiz;
				next();
			}else { next (new Error("No existe el quizId=" + quizId)); }
		}
	).catch (function(error){next(error);});
	
};

// GET /quizes/:id
exports.show = function (req,res){
	res.render('quizes/show',{quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function (req,res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto'
	}
	res.render('quizes/answer',{quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/
exports.index = function (req,res){
	texto_buscar = '%';
	if (req.query.search)
	{
		texto_buscar += req.query.search.replace(' ','%') + '%';

	}
	console.log("Texto a buscar:" + texto_buscar);
	models.Quiz.findAll({where: ["pregunta like ?", texto_buscar],order: [['pregunta', 'ASC']]}).then(
		function(quizes){
			res.render('quizes/index.ejs',{quizes: quizes, errors: []});
		}
	).catch(function(error){next (error);});
};

// GET /quizes/new
exports.new = function (req,res){
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
	);

	res.render('quizes/new',{quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	// guardar en DB los campos pretunta y respuesta de quiz
	console.log(quiz)
	quiz
	.validate()
	.then(
		function (err) {
			if (err) {
				res.render('quizes/new',{quiz: quiz, errors: err.errors});
			} else {
				quiz
				.save({fields: ["pregunta","respuesta","tema"]})
				.then(function () { res.redirect('/quizes');}) // Redireccion HTTP (URL relativo) lista de preguntas
			}
		}
	);		
};

// GET quizes/:id/edit
exports.edit = function (req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	console.log("req.quiz.tema=" + req.quiz.tema);
	req.quiz.tema = req.body.quiz.tema;

	// guardar en DB los campos pretunta y respuesta de quiz
	req.quiz
	.validate()
	.then(
		function (err) {
			if (err) {
				res.render('quizes/edit',{quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz
				.save({fields: ["pregunta","respuesta","tema"]})
				.then(function () { res.redirect('/quizes');}) // Redireccion HTTP (URL relativo) lista de preguntas
			}
		}
	);		
};

// DELETE /quizes/:id

exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next (error)});
};


// GET /author
exports.author = function (req,res){
	res.render('author',{quiz: req.quiz, errors: []});
};

// GET /statistics
exports.statistics = function (req,res){
	var sts = {
		preguntas: 0,
		comentarios: 0,
		media_comentarios: 0,
		preguntas_sin_comentarios: 0,
		preguntas_con_comentarios: 0
	};

	Sequelize.Promise.all([
		models.Quiz.count(),
		models.Comment.count(),
		models.Quiz.findAll({ include: [{model: models.Comment, required: true}]}),
		])
	.then(function (dataQuerys){
		sts.preguntas = dataQuerys[0];
		sts.comentarios = dataQuerys[1];
		sts.media_comentarios = sts.comentarios / sts.preguntas;
		sts.preguntas_con_comentarios = dataQuerys[2].length;
		sts.preguntas_sin_comentarios = sts.preguntas - sts.preguntas_con_comentarios;
	})
	.finally(function (){
		res.render('quizes/statistics',{quiz: req.quiz, sts: sts, errors: []});	
	});
};