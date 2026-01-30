-- This is an empty migration.
-- Drop old column
ALTER TABLE "RecipeSearchIndex"
DROP COLUMN IF EXISTS embedding;

-- Add column with new size
ALTER TABLE "RecipeSearchIndex"
ADD COLUMN embedding vector(384);

-- Recreate index
DROP INDEX IF EXISTS recipe_embedding_idx;

CREATE INDEX recipe_embedding_idx
ON "RecipeSearchIndex"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
