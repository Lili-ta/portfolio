using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Portfolio.Api.Models;

public class VisitCountDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = "site";

    public long Count { get; set; }

    public DateTime LastUpdated { get; set; }
}
