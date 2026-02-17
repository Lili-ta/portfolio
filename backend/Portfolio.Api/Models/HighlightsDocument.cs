using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Portfolio.Api.Models;

public class HighlightsDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = "highlights";

    public List<HighlightItem> Items { get; set; } = new();
}

public class HighlightItem
{
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
    public int Order { get; set; }
}
