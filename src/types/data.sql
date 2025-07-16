CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    icon TEXT,
    parent_id TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    character_count INTEGER NOT NULL DEFAULT 0,
    line_count INTEGER NOT NULL DEFAULT 0,
    stats_last_calculated DATETIME,
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE TABLE note_aliases (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    alias TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(note_id, alias)
);

CREATE TABLE note_links (
    id TEXT PRIMARY KEY,
    source_note_id TEXT NOT NULL,
    target_note_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(source_note_id, target_note_id)
);


CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(note_id)
);

-- PROPIEDADES 

CREATE TABLE global_properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('text', 'list', 'number', 'check', 'date', 'datetime')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

-- Valores sugeridos para propiedades globales (principalmente para text y list)
CREATE TABLE global_property_suggestions (
    id TEXT PRIMARY KEY,
    global_property_id TEXT NOT NULL,
    suggested_value TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (global_property_id) REFERENCES global_properties(id) ON DELETE CASCADE,
    UNIQUE(global_property_id, suggested_value)
);


CREATE TABLE note_properties (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    global_property_id TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'list', 'number', 'check', 'date', 'datetime')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (global_property_id) REFERENCES global_properties(id) ON DELETE SET NULL,
    UNIQUE(note_id, name)
);

-- Valores de texto
CREATE TABLE property_values_text (
    property_id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE
);

-- Valores de lista (múltiples valores por propiedad)
CREATE TABLE property_values_list (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    value TEXT NOT NULL,
    position INTEGER NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE,
    UNIQUE(property_id, position)
);

-- Valores numéricos
CREATE TABLE property_values_number (
    property_id TEXT PRIMARY KEY,
    value REAL NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE
);

-- Valores booleanos
CREATE TABLE property_values_check (
    property_id TEXT PRIMARY KEY,
    value BOOLEAN NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE
);

-- Valores de fecha
CREATE TABLE property_values_date (
    property_id TEXT PRIMARY KEY,
    value DATE NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE
);

-- Valores de fecha y hora
CREATE TABLE property_values_datetime (
    property_id TEXT PRIMARY KEY,
    value DATETIME NOT NULL,
    
    FOREIGN KEY (property_id) REFERENCES note_properties(id) ON DELETE CASCADE
);

-- Trigger para actualizar modified_at en notes
CREATE TRIGGER update_notes_modified_at
    AFTER UPDATE ON notes
    FOR EACH ROW
    WHEN NEW.modified_at = OLD.modified_at
BEGIN
    UPDATE notes SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
