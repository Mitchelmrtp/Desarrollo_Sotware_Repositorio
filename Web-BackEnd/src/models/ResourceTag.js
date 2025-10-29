/**
 * ResourceTag Model
 * Implementa la tabla intermedia para la relación many-to-many entre recursos y etiquetas
 */

import { DataTypes, Model } from 'sequelize';
import { Logger } from '../utils/Logger.js';

export class ResourceTag extends Model {
    // Métodos estáticos
    static async addTagToResource(resourceId, tagId) {
        try {
            const [resourceTag, created] = await this.findOrCreate({
                where: { resource_id: resourceId, tag_id: tagId },
                defaults: { resource_id: resourceId, tag_id: tagId }
            });
            
            if (created) {
                Logger.info(`Tag ${tagId} added to resource ${resourceId}`);
            }
            
            return resourceTag;
        } catch (error) {
            Logger.error('Error adding tag to resource:', error);
            throw error;
        }
    }

    static async removeTagFromResource(resourceId, tagId) {
        try {
            const result = await this.destroy({
                where: { resource_id: resourceId, tag_id: tagId }
            });
            
            if (result) {
                Logger.info(`Tag ${tagId} removed from resource ${resourceId}`);
            }
            
            return result;
        } catch (error) {
            Logger.error('Error removing tag from resource:', error);
            throw error;
        }
    }

    static async getResourceTags(resourceId) {
        return await this.findAll({
            where: { resource_id: resourceId }
        });
    }

    static async getTagResources(tagId) {
        return await this.findAll({
            where: { tag_id: tagId }
        });
    }
}

export const ResourceTagModel = (sequelize) => {
    ResourceTag.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the resource-tag relationship'
        },
        resource_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID of the resource'
        },
        tag_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID of the tag'
        },
        created_by: {
            type: DataTypes.UUID,
            comment: 'ID of the user who created this relationship'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata'
        }
    }, {
        sequelize,
        modelName: 'ResourceTag',
        tableName: 'resource_tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['resource_id', 'tag_id']
            },
            {
                fields: ['resource_id']
            },
            {
                fields: ['tag_id']
            },
            {
                fields: ['created_by']
            }
        ],
        hooks: {
            afterCreate: async (resourceTag) => {
                // Incrementar contador de uso de la etiqueta
                const Tag = sequelize.models.Tag;
                if (Tag) {
                    await Tag.increment('usage_count', {
                        where: { id: resourceTag.tag_id }
                    });
                }
                Logger.info(`Resource-Tag relationship created: ${resourceTag.resource_id} - ${resourceTag.tag_id}`);
            },
            afterDestroy: async (resourceTag) => {
                // Decrementar contador de uso de la etiqueta
                const Tag = sequelize.models.Tag;
                if (Tag) {
                    await Tag.decrement('usage_count', {
                        where: { id: resourceTag.tag_id }
                    });
                }
                Logger.info(`Resource-Tag relationship destroyed: ${resourceTag.resource_id} - ${resourceTag.tag_id}`);
            }
        }
    });

    return ResourceTag;
};