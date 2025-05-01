-- MySQL dump 10.13  Distrib 8.4.4, for Linux (x86_64)
--
-- Host: localhost    Database: db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ProjetContributeurs`
--

DROP TABLE IF EXISTS `ProjetContributeurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProjetContributeurs` (
  `createdAt` varchar(10) DEFAULT NULL,
  `updatedAt` varchar(10) DEFAULT NULL,
  `professionnelId` tinyint DEFAULT NULL,
  `projetId` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProjetContributeurs`
--

LOCK TABLES `ProjetContributeurs` WRITE;
/*!40000 ALTER TABLE `ProjetContributeurs` DISABLE KEYS */;
INSERT INTO `ProjetContributeurs` VALUES ('2025-04-30','2025-04-30',3,1745927122960),('2025-04-30','2025-04-30',10,1745927122960),('2025-04-30','2025-04-30',20,1745927122960),('2025-04-30','2025-04-30',12,1745856022160),('2025-04-30','2025-04-30',14,1745856022160),('2025-04-30','2025-04-30',15,1745856022160);
/*!40000 ALTER TABLE `ProjetContributeurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProjetResponsables`
--

DROP TABLE IF EXISTS `ProjetResponsables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProjetResponsables` (
  `createdAt` varchar(10) DEFAULT NULL,
  `updatedAt` varchar(10) DEFAULT NULL,
  `professionnelId` tinyint DEFAULT NULL,
  `projetId` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProjetResponsables`
--

LOCK TABLES `ProjetResponsables` WRITE;
/*!40000 ALTER TABLE `ProjetResponsables` DISABLE KEYS */;
INSERT INTO `ProjetResponsables` VALUES ('2025-04-30','2025-04-30',19,1745927122960),('2025-04-30','2025-04-30',10,1745697434506),('2025-04-30','2025-04-30',7,1745856022160);
/*!40000 ALTER TABLE `ProjetResponsables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` tinyint DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `createdAt` varchar(10) DEFAULT NULL,
  `updatedAt` varchar(10) DEFAULT NULL,
  `username` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (8,'florian.esparsa@gmail.com','$2b$10$.w6u2XfpH4wGN1Kc/GBpJ.yYlL39fCRE6CzI18IdUNqGe0/wyVFSi','2025-05-01','2025-05-01','Admin');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charges`
--

DROP TABLE IF EXISTS `charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charges` (
  `id` tinyint DEFAULT NULL,
  `date` varchar(0) DEFAULT NULL,
  `description` varchar(16) DEFAULT NULL,
  `categorie` varchar(8) DEFAULT NULL,
  `type` varchar(8) DEFAULT NULL,
  `montant` decimal(6,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charges`
--

LOCK TABLES `charges` WRITE;
/*!40000 ALTER TABLE `charges` DISABLE KEYS */;
INSERT INTO `charges` VALUES (1,'','Salaire Coordo','Autre','Variable',16000.0),(2,'','Doctolib','Internet','Fixe',16000.0),(3,'','Salle SISA','Loyer','Fixe',2400.0),(5,'','Loyer maison','Loyer','Variable',10000.0),(7,'','Internet cabinet','Internet','Fixe',100.0),(8,'','Test 2024','Autre','Fixe',10000.0);
/*!40000 ALTER TABLE `charges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting_attendees`
--

DROP TABLE IF EXISTS `meeting_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_attendees` (
  `meetingId` bigint DEFAULT NULL,
  `professionnelId` tinyint DEFAULT NULL,
  `createdAt` varchar(10) DEFAULT NULL,
  `updatedAt` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_attendees`
--

LOCK TABLES `meeting_attendees` WRITE;
/*!40000 ALTER TABLE `meeting_attendees` DISABLE KEYS */;
INSERT INTO `meeting_attendees` VALUES (1745927696642,3,'2025-04-29','2025-04-29'),(1745927696642,4,'2025-04-29','2025-04-29'),(1745927696642,6,'2025-04-29','2025-04-29'),(1745927696642,10,'2025-04-29','2025-04-29'),(1745927696642,12,'2025-04-29','2025-04-29'),(1745927696642,15,'2025-04-29','2025-04-29'),(1745927696642,16,'2025-04-29','2025-04-29'),(1745927696642,19,'2025-04-29','2025-04-29'),(1745927696642,20,'2025-04-29','2025-04-29'),(1745927696642,21,'2025-04-29','2025-04-29'),(1745927717497,3,'2025-04-29','2025-04-29'),(1745927717497,10,'2025-04-29','2025-04-29'),(1745927717497,13,'2025-04-29','2025-04-29'),(1745927717497,15,'2025-04-29','2025-04-29'),(1745927717497,20,'2025-04-29','2025-04-29'),(1745929937077,3,'2025-04-29','2025-04-29'),(1745929937077,13,'2025-04-29','2025-04-29'),(1745929937077,15,'2025-04-29','2025-04-29'),(1745929937077,20,'2025-04-29','2025-04-29'),(1745927696642,1,'2025-04-29','2025-04-29'),(1745927717497,14,'2025-04-30','2025-04-30'),(1745927717497,12,'2025-04-30','2025-04-30'),(1745929937077,14,'2025-04-30','2025-04-30'),(1746014645084,1,'2025-04-30','2025-04-30'),(1746014645084,13,'2025-04-30','2025-04-30'),(1746014645084,14,'2025-04-30','2025-04-30'),(1746014645084,15,'2025-04-30','2025-04-30');
/*!40000 ALTER TABLE `meeting_attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametres_repartition`
--

DROP TABLE IF EXISTS `parametres_repartition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametres_repartition` (
  `id` tinyint DEFAULT NULL,
  `partFixe` tinyint DEFAULT NULL,
  `facteurCogerant` decimal(2,1) DEFAULT NULL,
  `partRCP` tinyint DEFAULT NULL,
  `partProjets` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametres_repartition`
--

LOCK TABLES `parametres_repartition` WRITE;
/*!40000 ALTER TABLE `parametres_repartition` DISABLE KEYS */;
INSERT INTO `parametres_repartition` VALUES (1,62,1.5,17,21);
/*!40000 ALTER TABLE `parametres_repartition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professionnels`
--

DROP TABLE IF EXISTS `professionnels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professionnels` (
  `id` tinyint DEFAULT NULL,
  `Nom` varchar(22) DEFAULT NULL,
  `Profession` varchar(18) DEFAULT NULL,
  `Email` varchar(30) DEFAULT NULL,
  `Téléphone` varchar(10) DEFAULT NULL,
  `Statut` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professionnels`
--

LOCK TABLES `professionnels` WRITE;
/*!40000 ALTER TABLE `professionnels` DISABLE KEYS */;
INSERT INTO `professionnels` VALUES (1,'ESPARSA Florian','Médecin','dr.esparsa@gmail.com','620464238','Cogérant'),(2,'LAFITTE Jean Yves','Médecin','jylafitte@gmail.com','','Associé'),(3,'RAIMBAULT MALLET Marie','Médecin','m.raimbault80@hotmail.fr','762458652','Associé'),(4,'BOURVEN Margot','Médecin','margot.bourven@gmail.com','649529100','Associé'),(5,'CAMBERLEIN Bernard','Médecin','','','Associé'),(6,'LALIS Agnès','Pharmacien','alalis@totum.fr','662279867','Associé'),(7,'FERRON Valérie','Pharmacien','valerie.ferron@laposte.net','','Associé'),(8,'GAYRIN Esther','Pharmacien','esther.gayrin@outlook.com','','Associé'),(9,'GABORIAU Sandrine','Infirmière','sandrine-gaboriau@sfr.fr','','Associé'),(10,'POQUIN Sylvie','Infirmière','poquin.sylvie17@orange.fr','','Associé'),(11,'CHEMIN Emilie','Infirmière','chemin.emilie17@gmail.com','682120123','Associé'),(12,'BLAY Séverine','Infirmière','severine.blay@gmail.com','616456553','Associé'),(13,'TETAUD Virginie','Infirmière','ninitetaud@live.fr','680562395','Associé'),(14,'ARNAUD Marjorie','Infirmière','marjoriearnaud764@gmail.com','','Associé'),(15,'ARNAUD Sarah','Infirmière','saraharnaud@orange.fr','','Associé'),(16,'LELIEVRE Mélanie','Infirmière','lelievremelaniee@gmail.com','','Associé'),(17,'COLLADO Marta','Kinésithérapeute','martaccollado@hotmail.com','783134547','Associé'),(18,'CHAPELIER Ludovic','Kinésithérapeute','ludovic.chapelier@yahoo.fr','','Associé'),(19,'MOREL Emilie','Kinésithérapeute','emi-toy@hotmail.fr','','Associé'),(20,'SALIERNO Alexandra','Kinésithérapeute','alexsalierno@hotmail.com','','Associé'),(21,'LOPEZ Julien','Dentiste','julienlopez.dentiste@gmail.com','','Associé'),(22,'EGRETEAU Emmanuelle','Pédicure podologue','egreteau.podologue@gmail.com','','Associé'),(23,'CHAUVEL Pascal','Pédicure podologue','chavelpascal@icloud.com','','Associé'),(26,'ESPARSA Michel','Autre','michel.esparsa@gmail.com','0623333333','Cogérant');
/*!40000 ALTER TABLE `professionnels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projets`
--

DROP TABLE IF EXISTS `projets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projets` (
  `id` bigint DEFAULT NULL,
  `titre` varchar(15) DEFAULT NULL,
  `annee` smallint DEFAULT NULL,
  `poids` tinyint DEFAULT NULL,
  `statut` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projets`
--

LOCK TABLES `projets` WRITE;
/*!40000 ALTER TABLE `projets` DISABLE KEYS */;
INSERT INTO `projets` VALUES (1745697434506,'crise sanitaire',2025,1,'en-cours'),(1745855642292,'projet1',2026,2,'valide'),(1745856022160,'2',2024,3,'valide'),(1745927122960,'1',2024,2,'valide');
/*!40000 ALTER TABLE `projets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rcp_meetings`
--

DROP TABLE IF EXISTS `rcp_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rcp_meetings` (
  `id` bigint DEFAULT NULL,
  `date` varchar(0) DEFAULT NULL,
  `titre` tinyint DEFAULT NULL,
  `description` varchar(6) DEFAULT NULL,
  `duree` smallint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rcp_meetings`
--

LOCK TABLES `rcp_meetings` WRITE;
/*!40000 ALTER TABLE `rcp_meetings` DISABLE KEYS */;
INSERT INTO `rcp_meetings` VALUES (1745927696642,'',1,'1',60),(1745927717497,'',2,'2',120),(1745929937077,'',3,'sdfqsd',200),(1746014645084,'',4,'',60);
/*!40000 ALTER TABLE `rcp_meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenus`
--

DROP TABLE IF EXISTS `revenus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenus` (
  `id` bigint DEFAULT NULL,
  `date` varchar(0) DEFAULT NULL,
  `description` varchar(17) DEFAULT NULL,
  `montant` decimal(6,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenus`
--

LOCK TABLES `revenus` WRITE;
/*!40000 ALTER TABLE `revenus` DISABLE KEYS */;
INSERT INTO `revenus` VALUES (1745690737939,'','QCI',75600.0),(1745690778339,'','ACI',75600.0),(1745855939305,'','2',20000.0),(1745861258014,'','test janvier 2025',10001.0),(1745861658112,'','test',15000.0),(1745861935569,'','test fevrier 2025',14000.0);
/*!40000 ALTER TABLE `revenus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sqlite_sequence`
--

DROP TABLE IF EXISTS `sqlite_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sqlite_sequence` (
  `name` varchar(22) DEFAULT NULL,
  `seq` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sqlite_sequence`
--

LOCK TABLES `sqlite_sequence` WRITE;
/*!40000 ALTER TABLE `sqlite_sequence` DISABLE KEYS */;
INSERT INTO `sqlite_sequence` VALUES ('charges',8),('professionnels',26),('parametres_repartition',1),('Users',8);
/*!40000 ALTER TABLE `sqlite_sequence` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-11 13:30:01
