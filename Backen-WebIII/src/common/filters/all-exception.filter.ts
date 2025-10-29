import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * FILTRO GLOBAL DE EXCEPCIONES ENTERPRISE
 *
 * Maneja TODOS los errores de la aplicación de forma centralizada:
 * - 🔥 Errores HTTP de NestJS (404, 400, 409, etc.)
 * - 🔥 Errores de base de datos PostgreSQL
 * - 🔥 Errores de validación de DTOs (class-validator)
 * - 🔥 Errores de entity (hooks @BeforeInsert/@BeforeUpdate)
 * - 🔥 Errores de transformación (class-transformer)
 * - 🔥 Errores internos no capturados
 * - 🔥 Errores de autenticación y autorización
 */
@Catch() // ✅ Captura TODAS las excepciones
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    /**
     * 🎯 MÉTODO PRINCIPAL
     * Se ejecuta automáticamente cuando ocurre cualquier error
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        // ✅ Obtener contexto HTTP (request/response)
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // ✅ Analizar el error y extraer detalles
        const { status, message, errorCode, details } =
            this.getErrorDetails(exception);

        // ✅ Crear respuesta estandarizada
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...(errorCode && { errorCode }),
            ...(details && { details }),
        };

        // ✅ Logging inteligente según severidad
        if (status >= 500) {
            // 🔥 Errores del servidor - LOG CRÍTICO con stack trace
            this.logger.error(
                `[CRÍTICO] ${request.method} ${request.url} - ${message}`,
                exception instanceof Error
                    ? exception.stack
                    : JSON.stringify(exception),
            );
        } else if (status >= 400) {
            // ⚠️ Errores del cliente - LOG de advertencia
            this.logger.warn(
                `[CLIENTE] ${request.method} ${request.url} - ${message}`,
            );
        } else {
            // ℹ️ Otros códigos - LOG informativo
            this.logger.log(`[INFO] ${request.method} ${request.url} - ${message}`);
        }

        // ✅ Enviar respuesta al cliente
        response.status(status).json(errorResponse);
    }

    /**
     * 🧠 ANALIZADOR PRINCIPAL DE ERRORES
     * Determina el tipo de error y extrae información relevante
     */
    private getErrorDetails(exception: unknown): {
        status: number;
        message: string;
        errorCode?: string;
        details?: any;
    } {
        // 🔥 ERRORES HTTP DE NESTJS (NotFoundException, BadRequestException, etc.)
        if (exception instanceof HttpException) {
            return this.handleHttpException(exception);
        }

        // 🔥 ERRORES DE BASE DE DATOS POSTGRESQL
        if (this.isDatabaseError(exception)) {
            return this.handleDatabaseError(exception as any);
        }

        // 🔥 ERRORES DE VALIDACIÓN (class-validator)
        if (this.isValidationError(exception)) {
            return this.handleValidationError(exception as any);
        }

        // 🔥 ERRORES DE ENTITY (hooks @BeforeInsert, @BeforeUpdate)
        if (this.isEntityValidationError(exception)) {
            return this.handleEntityValidationError(exception as Error);
        }

        // 🔥 ERRORES DE TRANSFORMACIÓN (class-transformer)
        if (this.isTransformationError(exception)) {
            return this.handleTransformationError(exception as Error);
        }

        // 🔥 ERRORES DE TYPEORM (conexión, consultas)
        if (this.isTypeOrmError(exception)) {
            return this.handleTypeOrmError(exception as any);
        }

        // 🔥 ERRORES DE JWT/AUTH
        if (this.isAuthError(exception)) {
            return this.handleAuthError(exception as Error);
        }

        // 🔥 ERROR GENÉRICO NO IDENTIFICADO
        this.logger.error('Error no identificado en la aplicación:', exception);
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error interno del servidor',
            errorCode: 'INTERNAL_ERROR',
        };
    }

    /**
     * 📨 MANEJADOR DE HTTPEXCEPTION
     * Errores lanzados manualmente con throw new NotFoundException(), etc.
     */
    private handleHttpException(exception: HttpException): {
        status: number;
        message: string;
        details?: any;
    } {
        const status = exception.getStatus();
        const response = exception.getResponse();

        let message: string;
        let details: any;

        if (typeof response === 'string') {
            message = response;
        } else if (typeof response === 'object' && response !== null) {
            const responseObj = response as any;

            // ✅ Para errores de validación con múltiples mensajes
            if (Array.isArray(responseObj.message)) {
                message = 'Errores de validación';
                details = responseObj.message;
            } else {
                message = responseObj.message || responseObj.error || exception.message;
                details = responseObj.details;
            }
        } else {
            message = exception.message;
        }

        return { status, message, details };
    }

    /**
     * 🔍 DETECTOR DE ERRORES DE BASE DE DATOS
     */
    private isDatabaseError(exception: any): boolean {
        return (
            exception &&
            typeof exception === 'object' &&
            'code' in exception! &&
            typeof (exception as any).code === 'string'
        );
    }

    /**
     * 🗄️ MANEJADOR DE ERRORES DE POSTGRESQL
     * Convierte códigos de error PostgreSQL a mensajes específicos para tu proyecto
     */
    private handleDatabaseError(error: any): {
        status: number;
        message: string;
        errorCode: string;
    } {
        switch (error.code) {
            // ✅ VIOLACIÓN DE CONSTRAINT ÚNICO (duplicados)
            case '23505':
                return {
                    status: HttpStatus.CONFLICT,
                    message: this.getUniqueViolationMessage(error),
                    errorCode: 'DUPLICATE_ENTRY',
                };

            // ✅ VIOLACIÓN DE FOREIGN KEY
            case '23503':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: this.getForeignKeyViolationMessage(error),
                    errorCode: 'FOREIGN_KEY_VIOLATION',
                };

            // ✅ CAMPO REQUERIDO NULO
            case '23502':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: this.getNullViolationMessage(error),
                    errorCode: 'MISSING_REQUIRED_FIELDS',
                };

            // ✅ DATOS DEMASIADO LARGOS
            case '22001':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Los datos son demasiado largos para el campo',
                    errorCode: 'DATA_TOO_LONG',
                };

            // ✅ VIOLACIÓN DE CHECK CONSTRAINT
            case '23514':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Los datos no cumplen las restricciones definidas',
                    errorCode: 'CHECK_VIOLATION',
                };

            // ✅ TIPO DE DATO INVÁLIDO
            case '22P02':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Tipo de dato inválido en la consulta',
                    errorCode: 'INVALID_DATA_TYPE',
                };

            // ✅ DIVISIÓN POR CERO
            case '22012':
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'División por cero en operación matemática',
                    errorCode: 'DIVISION_BY_ZERO',
                };

            // ✅ CONEXIÓN PERDIDA
            case '08006':
                return {
                    status: HttpStatus.SERVICE_UNAVAILABLE,
                    message: 'Conexión con la base de datos perdida',
                    errorCode: 'CONNECTION_LOST',
                };

            // ✅ ERROR NO MANEJADO ESPECÍFICAMENTE
            default:
                this.logger.error('Error de base de datos no manejado:', {
                    code: error.code,
                    message: error.message,
                    detail: error.detail,
                    constraint: error.constraint,
                });
                return {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Error en la base de datos',
                    errorCode: 'DATABASE_ERROR',
                };
        }
    }

    /**
     * 📝 GENERADOR DE MENSAJES ESPECÍFICOS PARA CONSTRAINT ÚNICO
     * Basado en tus entities específicas
     */
    private getUniqueViolationMessage(error: any): string {
        const detail = error.detail || '';
        const constraint = error.constraint || '';

        // ✅ USERS - Email duplicado
        if (detail.includes('email') || constraint.includes('email')) {
            return 'Ya existe un usuario registrado con este email';
        }

        // ✅ USERS - Documento duplicado
        if (
            detail.includes('document_number') ||
            constraint.includes('document_number')
        ) {
            return 'Ya existe un usuario con este número de documento';
        }

        // ✅ PRODUCTS - Nombre duplicado
        if (
            detail.includes('products') &&
            (detail.includes('name') || constraint.includes('name'))
        ) {
            return 'Ya existe un producto con este nombre';
        }

        // ✅ PRODUCTS - Slug duplicado
        if (detail.includes('slug') || constraint.includes('slug')) {
            return 'Ya existe un producto con esta URL (slug)';
        }

        // ✅ CATEGORIES - Nombre duplicado
        if (
            detail.includes('categories') &&
            (detail.includes('name') || constraint.includes('name'))
        ) {
            return 'Ya existe una categoría con este nombre';
        }

        // ✅ ROLES - Nombre duplicado
        if (
            detail.includes('roles') &&
            (detail.includes('name') || constraint.includes('name'))
        ) {
            return 'Ya existe un rol con este nombre';
        }

        // ✅ Mensaje genérico
        return 'Ya existe un registro con estos datos';
    }

    /**
     * 🔗 GENERADOR DE MENSAJES PARA FOREIGN KEY
     */
    private getForeignKeyViolationMessage(error: any): string {
        const detail = error.detail || '';
        const constraint = error.constraint || '';

        if (constraint.includes('category') || detail.includes('category')) {
            return 'La categoría especificada no existe';
        }

        if (constraint.includes('role') || detail.includes('role')) {
            return 'El rol especificado no existe';
        }

        if (constraint.includes('product') || detail.includes('product')) {
            return 'El producto especificado no existe';
        }

        if (constraint.includes('user') || detail.includes('user')) {
            return 'El usuario especificado no existe';
        }

        return 'Referencia a datos que no existen en el sistema';
    }

    /**
     * ❌ GENERADOR DE MENSAJES PARA CAMPOS NULOS
     */
    private getNullViolationMessage(error: any): string {
        const column = error.column || '';

        const fieldMessages: Record<string, string> = {
            email: 'El email es obligatorio',
            password: 'La contraseña es obligatoria',
            full_name: 'El nombre completo es obligatorio',
            document_number: 'El número de documento es obligatorio',
            name: 'El nombre es obligatorio',
            price: 'El precio es obligatorio',
            category_id: 'La categoría es obligatoria',
            role_id: 'El rol es obligatorio',
        };

        return fieldMessages[column] || `El campo ${column} es obligatorio`;
    }

    /**
     * ✅ DETECTOR DE ERRORES DE VALIDACIÓN
     */
    private isValidationError(exception: unknown): boolean {
        if (!(exception instanceof Error)) return false;

        const validationIndicators = [
            'ValidationError',
            'validate',
            'validation failed',
            'Bad Request Exception',
        ];

        return validationIndicators.some(
            (indicator) =>
                exception.name.includes(indicator) ||
                exception.message.toLowerCase().includes(indicator.toLowerCase()),
        );
    }

    /**
     * 📋 MANEJADOR DE ERRORES DE VALIDACIÓN
     */
    private handleValidationError(error: Error): {
        status: number;
        message: string;
        errorCode: string;
        details?: any;
    } {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Los datos enviados no son válidos',
            errorCode: 'VALIDATION_ERROR',
            details: error.message,
        };
    }

    /**
     * 🏗️ DETECTOR DE ERRORES DE ENTITY
     */
    private isEntityValidationError(exception: unknown): boolean {
        if (!(exception instanceof Error)) return false;

        const entityErrorIndicators = [
            'El porcentaje debe estar entre',
            'El monto fijo debe ser mayor',
            'Percentage must be between',
            'Fixed amount must be greater',
            'must be between',
            'greater than',
            'less than',
        ];

        return entityErrorIndicators.some((indicator) =>
            exception.message.includes(indicator),
        );
    }

    /**
     * 🏗️ MANEJADOR DE ERRORES DE ENTITY
     */
    private handleEntityValidationError(error: Error): {
        status: number;
        message: string;
        errorCode: string;
    } {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message,
            errorCode: 'ENTITY_VALIDATION_ERROR',
        };
    }

    /**
     * 🔄 DETECTOR DE ERRORES DE TRANSFORMACIÓN
     */
    private isTransformationError(exception: unknown): boolean {
        if (!(exception instanceof Error)) return false;

        return (
            exception.name.includes('Transform') ||
            exception.message.includes('transform') ||
            exception.message.includes('convert') ||
            exception.message.includes('cast')
        );
    }

    /**
     * 🔄 MANEJADOR DE ERRORES DE TRANSFORMACIÓN
     */
    private handleTransformationError(error: Error): {
        status: number;
        message: string;
        errorCode: string;
    } {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Error en la transformación de datos',
            errorCode: 'TRANSFORMATION_ERROR',
        };
    }

    /**
     * 🔍 DETECTOR DE ERRORES DE TYPEORM
     */
    private isTypeOrmError(exception: unknown): boolean {
        if (!(exception instanceof Error)) return false;

        return (
            exception.name.includes('TypeORM') ||
            exception.name.includes('QueryFailed') ||
            exception.name.includes('Repository') ||
            exception.message.includes('relation') ||
            exception.message.includes('entity')
        );
    }

    /**
     * 🔍 MANEJADOR DE ERRORES DE TYPEORM
     */
    private handleTypeOrmError(error: any): {
        status: number;
        message: string;
        errorCode: string;
    } {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error en la consulta a la base de datos',
            errorCode: 'TYPEORM_ERROR',
        };
    }

    /**
     * 🔐 DETECTOR DE ERRORES DE AUTENTICACIÓN/AUTORIZACIÓN
     */
    private isAuthError(exception: unknown): boolean {
        if (!(exception instanceof Error)) return false;

        const authErrorIndicators = [
            'Unauthorized',
            'Forbidden',
            'jwt',
            'token',
            'authentication',
            'authorization',
            'JsonWebToken',
        ];

        return authErrorIndicators.some(
            (indicator) =>
                exception.name.includes(indicator) ||
                exception.message.toLowerCase().includes(indicator.toLowerCase()),
        );
    }

    /**
     * 🔐 MANEJADOR DE ERRORES DE AUTH
     */
    private handleAuthError(error: Error): {
        status: number;
        message: string;
        errorCode: string;
    } {
        if (error.message.includes('jwt') || error.message.includes('token')) {
            return {
                status: HttpStatus.UNAUTHORIZED,
                message: 'Token de autenticación inválido o expirado',
                errorCode: 'INVALID_TOKEN',
            };
        }

        if (error.message.toLowerCase().includes('unauthorized')) {
            return {
                status: HttpStatus.UNAUTHORIZED,
                message: 'Credenciales de acceso inválidas',
                errorCode: 'UNAUTHORIZED',
            };
        }

        if (error.message.toLowerCase().includes('forbidden')) {
            return {
                status: HttpStatus.FORBIDDEN,
                message: 'No tienes permisos para realizar esta acción',
                errorCode: 'FORBIDDEN',
            };
        }

        return {
            status: HttpStatus.UNAUTHORIZED,
            message: 'Error de autenticación',
            errorCode: 'AUTH_ERROR',
        };
    }
}
