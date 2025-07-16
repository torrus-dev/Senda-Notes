# Implementation Plan

- [ ]  1. Create foundational domain types and value objects
   - Implement NoteId value object with validation and factory methods
   - Implement NoteTitle value object with sanitization and validation
   - Implement NotePath value object for hierarchical path handling
   - Create base Result type for error handling
   - Create domain-specific error types (NoteError, InvalidNoteTitleError, etc.)
   - _Requirements: 1.1, 1.3, 1.4_

- [ ]  2. Implement Note entity with business logic
   - Create NoteEntity class with private constructor and factory methods
   - Implement business methods (updateTitle, updateContent, addChild, removeChild)
   - Add validation logic and business rules enforcement
   - Implement toDTO/fromDTO conversion methods
   - Add validation for circular references and business invariants
   - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]  3. Create domain events and event bus system
   - Implement base DomainEvent interface and concrete event types
   - Create InMemoryEventBus with publish/subscribe functionality
   - Implement NoteCreatedEvent, NoteUpdatedEvent, NoteDeletedEvent
   - _Requirements: 2.2, 4.2_

- [ ]  4. Implement repository interface and localStorage implementation
   - Define INoteRepository interface with all CRUD operations
   - Implement LocalStorageNoteRepository with async methods
   - Add proper error handling and data validation in repository
   - Implement DTO conversion and DateTime serialization/deserialization
   - _Requirements: 3.1, 3.2, 4.1, 4.2_

- [ ]  5. Create NoteService with business orchestration
   - Implement INoteService interface with all use cases
   - Add createNote method with validation and unique title generation
   - Implement updateNote with business rule validation
   - Add deleteNoteWithDescendants with cascade deletion logic
   - Implement moveNote with circular reference validation
   - Add createNoteFromPath for hierarchical note creation
   - Integrate event publishing for all operations
   - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ]  6. Integrate Svelte $state reactive system
   - Add reactive state management to NoteService using $state
   - Implement reactive getters for notes collection and active note
   - Ensure state updates trigger UI reactivity properly
   - _Requirements: 4.2, 5.1, 5.2_

- [ ]  7. Refactor NoteController to use service layer
   - Simplify NoteController to only handle UI coordination
   - Remove all business logic and direct data manipulation
   - Integrate with NoteService for all business operations
   - Add proper error handling and user feedback
   - Implement UI state management (focus, notifications, workspace)
   - Update all event handlers to delegate to service layer
   - _Requirements: 2.1, 2.2, 2.3, 3.2, 5.1_

- [ ]  8. Update dependency injection and service registration
   - Create service container or dependency injection setup
   - Register all services, repositories, and controllers
   - Ensure proper singleton lifecycle management
   - Update startupManager to initialize new architecture
   - _Requirements: 3.1, 3.2, 5.1_

- [ ]  9. Migrate existing data and maintain compatibility
   - Create data migration utilities for existing localStorage data
   - Ensure backward compatibility with current note format
   - Add validation for migrated data integrity
   - Test migration with your existing notes manually
   - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2_

- [ ]  10. Update remaining controllers to use new architecture
   - Refactor noteQueryController to use NoteService
   - Update notePathController to use new NotePath value object
   - Modify other note-related controllers to use service layer
   - Remove direct model access from all controllers
   - _Requirements: 2.1, 2.2, 3.2, 6.3_

- [ ]  11. Add comprehensive error handling and user feedback
   - Implement proper error propagation from domain to UI
   - Add user-friendly error messages for all business rule violations
   - Create error recovery mechanisms where appropriate
   - Test error scenarios manually in the app
   - _Requirements: 1.4, 2.3, 4.2_

- [ ]  12. Final integration and manual validation
   - Ensure all existing functionality works with new architecture
   - Validate that UI behavior remains exactly the same
   - Test all user workflows manually
   - Verify data integrity and consistency
   - Clean up old code and remove deprecated components
   - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.2, 6.4_
