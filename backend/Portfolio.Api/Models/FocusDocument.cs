using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Portfolio.Api.Models;

public class FocusDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = "focus";

    public string Text { get; set; } = "";

    public DateTime Updated { get; set; }
}
