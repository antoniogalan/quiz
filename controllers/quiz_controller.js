var models = require('../models/models.js');

// GET /quizes/:id
exports.load = function (req, res, next, quizId){
	console.log('Valor de quizId es:' + quizId);
	models.Quiz.findById(quizId).then(
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
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	res.render('quizes/new',{quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	// guardar en DB los campos pretunta y respuesta de quiz
	quiz
	.validate()
	.then(
		function (err) {
			if (err) {
				res.render('quizes/new',{quiz: quiz, errors: err.errors});
			} else {
				quiz
				.save({fields: ["pregunta","respuesta"]})
				.then(function () { res.redirect('/quizes');}) // Redireccion HTTP (URL relativo) lista de preguntas
			}
		}
	);		
};

// GET /author
exports.author = function (req,res){
	res.render('author');
};