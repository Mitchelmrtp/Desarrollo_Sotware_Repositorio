import { Resource, Category, User } from '../models/index.js';
import { Op } from 'sequelize';

// Get FAQ (Frequently Asked Questions)
export const getFAQ = async (req, res) => {
    try {
        // In a real application, you might have a FAQ model/table
        // For now, we'll return static FAQ data
        const faq = [
            {
                id: 1,
                question: "¿Cómo puedo subir un recurso?",
                answer: "Para subir un recurso, inicia sesión en tu cuenta, ve a 'Mis Recursos' y haz clic en 'Nuevo Recurso'. Completa el formulario con toda la información necesaria.",
                category: "recursos"
            },
            {
                id: 2,
                question: "¿Qué tipos de archivos puedo subir?",
                answer: "Aceptamos archivos PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX y archivos de imagen (PNG, JPG, JPEG). El tamaño máximo es de 50MB por archivo.",
                category: "archivos"
            },
            {
                id: 3,
                question: "¿Cómo puedo cambiar mi contraseña?",
                answer: "Ve a tu perfil, haz clic en 'Configuración' y luego en 'Cambiar Contraseña'. Ingresa tu contraseña actual y la nueva contraseña.",
                category: "cuenta"
            },
            {
                id: 4,
                question: "¿Los recursos son gratuitos?",
                answer: "Sí, todos los recursos en nuestra plataforma son completamente gratuitos para uso educativo.",
                category: "general"
            },
            {
                id: 5,
                question: "¿Cómo reporto contenido inapropiado?",
                answer: "Puedes reportar contenido inapropiado haciendo clic en el botón 'Reportar' que se encuentra en cada recurso, o contactándonos directamente.",
                category: "moderacion"
            }
        ];

        const { category } = req.query;

        let filteredFAQ = faq;
        if (category) {
            filteredFAQ = faq.filter(item => item.category === category);
        }

        res.json({
            faq: filteredFAQ,
            categories: ["general", "recursos", "archivos", "cuenta", "moderacion"]
        });

    } catch (error) {
        console.error('Get FAQ error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Submit contact form
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message, type = 'general' } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos',
                required: ['name', 'email', 'subject', 'message']
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }

        // In a real application, you would:
        // 1. Save the contact form to a database
        // 2. Send an email notification to admins
        // 3. Send a confirmation email to the user

        // For now, we'll just log it and return success
        console.log('Contact form submission:', {
            name,
            email,
            subject,
            message,
            type,
            timestamp: new Date(),
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });

        res.status(201).json({
            message: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.',
            ticketId: Date.now().toString() // Generate a simple ticket ID
        });

    } catch (error) {
        console.error('Submit contact form error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get help articles/guides
export const getHelpArticles = async (req, res) => {
    try {
        // In a real application, you might have help articles stored as resources
        // or in a separate help articles table
        const helpArticles = [
            {
                id: 1,
                title: "Guía de inicio rápido",
                description: "Aprende los conceptos básicos para usar la plataforma",
                category: "primeros-pasos",
                content: "Esta es una guía completa para nuevos usuarios...",
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-15')
            },
            {
                id: 2,
                title: "Cómo subir recursos educativos",
                description: "Paso a paso para compartir tus materiales",
                category: "recursos",
                content: "Sigue estos pasos para subir tus recursos...",
                created_at: new Date('2024-01-05'),
                updated_at: new Date('2024-01-10')
            },
            {
                id: 3,
                title: "Gestión de tu perfil",
                description: "Personaliza y configura tu cuenta",
                category: "perfil",
                content: "Aprende a personalizar tu perfil...",
                created_at: new Date('2024-01-03'),
                updated_at: new Date('2024-01-12')
            }
        ];

        const { category, search } = req.query;

        let filteredArticles = helpArticles;

        if (category) {
            filteredArticles = filteredArticles.filter(article => article.category === category);
        }

        if (search) {
            const searchTerm = search.toLowerCase();
            filteredArticles = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm)
            );
        }

        res.json({
            articles: filteredArticles,
            categories: ["primeros-pasos", "recursos", "perfil", "busqueda", "configuracion"]
        });

    } catch (error) {
        console.error('Get help articles error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get specific help article
export const getHelpArticle = async (req, res) => {
    try {
        const { id } = req.params;

        // In a real application, you would fetch from database
        const article = {
            id: parseInt(id),
            title: "Artículo de ayuda",
            description: "Descripción del artículo",
            category: "general",
            content: `
# Artículo de Ayuda

Este es el contenido completo del artículo de ayuda.

## Sección 1
Contenido de la primera sección...

## Sección 2
Contenido de la segunda sección...

### Subsección
Más detalles aquí...
            `,
            created_at: new Date(),
            updated_at: new Date(),
            views: 150
        };

        if (!article) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        res.json({ article });

    } catch (error) {
        console.error('Get help article error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Report a problem
export const reportProblem = async (req, res) => {
    try {
        const { 
            type, 
            description, 
            resource_id, 
            url, 
            browser_info,
            steps_to_reproduce 
        } = req.body;

        if (!type || !description) {
            return res.status(400).json({ 
                message: 'El tipo y la descripción son requeridos' 
            });
        }

        const validTypes = [
            'bug',
            'inappropriate_content',
            'copyright_violation',
            'spam',
            'other'
        ];

        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                message: 'Tipo de reporte inválido',
                validTypes
            });
        }

        // In a real application, save to database and notify moderators
        console.log('Problem report:', {
            type,
            description,
            resource_id,
            url,
            browser_info,
            steps_to_reproduce,
            user_id: req.user?.userId,
            timestamp: new Date(),
            ip: req.ip
        });

        res.status(201).json({
            message: 'Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.',
            reportId: Date.now().toString()
        });

    } catch (error) {
        console.error('Report problem error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get system status
export const getSystemStatus = async (req, res) => {
    try {
        // In a real application, you would check various system components
        const status = {
            overall: 'operational',
            services: {
                api: {
                    status: 'operational',
                    response_time: '120ms'
                },
                database: {
                    status: 'operational',
                    response_time: '25ms'
                },
                file_uploads: {
                    status: 'operational',
                    response_time: '300ms'
                },
                search: {
                    status: 'operational',
                    response_time: '80ms'
                }
            },
            last_updated: new Date(),
            incidents: [] // Recent incidents would go here
        };

        res.json({ status });

    } catch (error) {
        console.error('Get system status error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};