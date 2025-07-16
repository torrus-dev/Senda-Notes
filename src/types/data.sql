-- ESQUEMA HÍBRIDO OPTIMIZADO PARA TU APLICACIÓN

-- Tabla principal: estructura + contenido + propiedades como JSON
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    icon TEXT,
    parent_id TEXT,
    
    -- Estadísticas (calculadas en tiempo real, almacenadas para performance)
    word_count INTEGER NOT NULL DEFAULT 0,
    character_count INTEGER NOT NULL DEFAULT 0,
    line_count INTEGER NOT NULL DEFAULT 0,
    stats_last_calculated DATETIME,
    
    -- Metadatos como JSON (flexibilidad total)
    aliases TEXT DEFAULT '[]', -- JSON array de strings
    properties TEXT DEFAULT '[]', -- JSON array de NoteProperty
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Links entre notas (queries frecuentes, mejor en SQL)
CREATE TABLE note_links (
    id TEXT PRIMARY KEY,
    source_note_id TEXT NOT NULL,
    target_note_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(source_note_id, target_note_id)
);

-- Favoritos (consultas simples, mejor en SQL)
CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(note_id)
);

-- Propiedades globales (metadata simple, mejor en SQL)
CREATE TABLE global_properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('text', 'list', 'number', 'check', 'date', 'datetime')),
    suggested_values TEXT DEFAULT '[]', -- JSON array
    linked_properties TEXT DEFAULT '[]', -- JSON array de {noteId, propertyId}
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Triggers para timestamps automáticos
CREATE TRIGGER update_notes_modified_at
    AFTER UPDATE ON notes
    FOR EACH ROW
    WHEN NEW.modified_at = OLD.modified_at
BEGIN
    UPDATE notes SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_global_properties_updated_at
    AFTER UPDATE ON global_properties
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE global_properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Índices optimizados para tus consultas específicas
CREATE INDEX idx_notes_parent_id ON notes(parent_id);
CREATE INDEX idx_notes_title ON notes(title);
CREATE INDEX idx_notes_title_parent ON notes(title, parent_id); -- Para findNoteByTitleAndParent
CREATE INDEX idx_notes_modified_at ON notes(modified_at);
CREATE INDEX idx_note_links_source ON note_links(source_note_id);
CREATE INDEX idx_note_links_target ON note_links(target_note_id);

-- Vistas para consultas comunes en tus controladores
CREATE VIEW note_hierarchy AS
SELECT 
    n.id,
    n.title,
    n.parent_id,
    COUNT(child.id) as direct_children_count,
    GROUP_CONCAT(child.id, ',') as children_ids
FROM notes n
LEFT JOIN notes child ON child.parent_id = n.id
GROUP BY n.id, n.title, n.parent_id;

-- Vista para estadísticas rápidas
CREATE VIEW note_stats AS
SELECT 
    (SELECT COUNT(*) FROM notes) as total_notes,
    (SELECT COUNT(*) FROM notes WHERE parent_id IS NULL) as root_notes,
    (SELECT COUNT(*) FROM favorites) as favorite_notes,
    (SELECT COUNT(*) FROM note_links) as total_links;